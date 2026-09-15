import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";

const schema = z.object({ upiReference: z.string().min(4).max(100), note: z.string().max(500).optional() });

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    requireRole(session, ["AGENCY_OWNER", "SUPER_ADMIN"]);
    const body = schema.parse(await request.json());
    const requestRow = await prisma.upgradeRequest.create({ data: { agencyId: session.agencyId, upiReference: body.upiReference, note: body.note || null } });
    return NextResponse.json({ request: requestRow }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
