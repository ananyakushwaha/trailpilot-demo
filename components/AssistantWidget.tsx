"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hi! I’m the TrailPilot Assistant. Ask me about leads, bookings, WhatsApp, reports or billing." }]);

  async function send() {
    const message = input.trim();
    if (!message || sending) return;
    setInput(""); setMessages((current) => [...current, { role: "user", content: message }]); setSending(true);
    const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, history: messages.slice(-8) }) });
    const data = await response.json();
    setMessages((current) => [...current, { role: "assistant", content: response.ok ? data.answer : (data.error || "I could not answer that right now.") }]); setSending(false);
  }

  return <div className="fixed bottom-5 right-5 z-50 print-hide"><button onClick={() => setOpen(!open)} className="rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-xl hover:bg-blue-700">{open ? "Close assistant" : "Ask TrailPilot AI"}</button>{open && <div className="absolute bottom-14 right-0 flex h-[28rem] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="bg-[#071a33] px-4 py-3 text-white"><p className="font-semibold">TrailPilot Assistant</p><p className="text-xs text-slate-300">Powered by TrailPilot™</p></div><div className="flex-1 space-y-3 overflow-y-auto p-3">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${message.role === "user" ? "ml-auto bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>{message.content}</div>)}{sending && <div className="text-xs text-slate-400">Thinking...</div>}</div><div className="flex gap-2 border-t border-slate-200 p-3"><input className="input" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void send(); }} placeholder="Ask a question..." /><button className="btn-primary px-3" onClick={() => void send()} disabled={sending}>Send</button></div></div>}</div>;
}
