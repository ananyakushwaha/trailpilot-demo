import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireFeature, requireSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { FAQS } from "@/lib/faqs";

const bodySchema = z.object({ message: z.string().min(2).max(1000), history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).max(8).default([]) });

function faqFallback(message: string) {
  const words = message.toLowerCase().split(/\W+/).filter((word) => word.length > 2);
  const match = FAQS.map((faq) => ({ faq, score: words.filter((word) => `${faq.question} ${faq.answer}`.toLowerCase().includes(word)).length })).sort((a, b) => b.score - a.score)[0];
  return match && match.score > 0 ? `${match.faq.answer}\n\nYou can also open FAQs for more help.` : "I can help with leads, bookings, WhatsApp, reports, billing and team settings. Try asking: How do I connect WhatsApp?";
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    await requireFeature(session, "AI_ASSISTANT");
    const body = bodySchema.parse(await request.json());
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ answer: faqFallback(body.message), usedAI: false });
    const faqContext = FAQS.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join("\n\n");
    const response = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5", max_tokens: 500, system: `You are TrailPilot Assistant. Answer briefly and practically about using the TrailPilot travel CRM. Do not invent account data, prices or policies. If the question is unrelated, say you can help with TrailPilot. Use this FAQ knowledge:\n\n${faqContext}`, messages: [...body.history, { role: "user", content: body.message }] }) });
    if (!response.ok) return NextResponse.json({ answer: faqFallback(body.message), usedAI: false });
    const data = await response.json();
    return NextResponse.json({ answer: data.content?.[0]?.text || faqFallback(body.message), usedAI: true });
  } catch (error) {
    return handleApiError(error);
  }
}
