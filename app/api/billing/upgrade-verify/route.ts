import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";

const schema = z.object({ razorpay_order_id: z.string(), razorpay_payment_id: z.string(), razorpay_signature: z.string() });

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    requireRole(session, ["AGENCY_OWNER", "SUPER_ADMIN"]);
    const body = schema.parse(await request.json());
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ error: "Online payments are not configured yet." }, { status: 501 });
    const expected = crypto.createHmac("sha256", secret).update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`).digest("hex");
    if (expected.length !== body.razorpay_signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(body.razorpay_signature))) return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    const amount = Number(process.env.PREMIUM_PRICE_INR || "4999");
    await prisma.$transaction([
      prisma.billingPayment.create({ data: { agencyId: session.agencyId, providerOrderId: body.razorpay_order_id, providerPaymentId: body.razorpay_payment_id, amount } }),
      prisma.agency.update({ where: { id: session.agencyId }, data: { plan: "PREMIUM" } }),
    ]);
    return NextResponse.json({ ok: true, plan: "PREMIUM" });
  } catch (error) {
    return handleApiError(error);
  }
}
