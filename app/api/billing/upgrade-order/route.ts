import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";

export async function POST() {
  try {
    const session = await requireSession();
    requireRole(session, ["AGENCY_OWNER", "SUPER_ADMIN"]);
    if (!isRazorpayConfigured()) return NextResponse.json({ error: "Online payments are not configured yet." }, { status: 501 });
    const agency = await prisma.agency.findUniqueOrThrow({ where: { id: session.agencyId }, select: { plan: true } });
    if (agency.plan === "PREMIUM") return NextResponse.json({ error: "This business is already on Premium." }, { status: 400 });
    const amount = Number(process.env.PREMIUM_PRICE_INR || "4999");
    const order = await createRazorpayOrder(amount, `premium-${session.agencyId.slice(-12)}`);
    return NextResponse.json({ order, keyId: process.env.RAZORPAY_KEY_ID, amount });
  } catch (error) {
    return handleApiError(error);
  }
}
