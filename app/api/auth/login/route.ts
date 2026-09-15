import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  portal: z.enum(["agency", "hotel", "control"]).default("agency"),
});

export async function POST(request: NextRequest) {
  try {
    const body = loginSchema.parse(await request.json());

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (body.portal === "control" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "This account is not a Product Control Panel account" }, { status: 403 });
    }
    if (body.portal === "hotel" && user.role !== "HOTEL_PARTNER") {
      return NextResponse.json({ error: "This account is not a Hotel Owner account" }, { status: 403 });
    }
    if (body.portal === "agency" && (user.role === "SUPER_ADMIN" || user.role === "HOTEL_PARTNER")) {
      return NextResponse.json({ error: user.role === "HOTEL_PARTNER" ? "Use Hotel Owner Login for this account" : "Use Product Control Panel Login for this account" }, { status: 403 });
    }

    const token = await createSessionToken({
      userId: user.id,
      agencyId: user.agencyId,
      role: user.role,
      name: user.name,
      email: user.email,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
