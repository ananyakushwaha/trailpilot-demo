import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-response";
import { AuthError, requireRole, requireSession } from "@/lib/auth";
import { PLATFORM_FEATURES } from "@/lib/platform-features";
import { isControlPanelPasswordValid } from "@/lib/control-panel";

const updateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("feature"), key: z.string(), enabled: z.boolean() }),
  z.object({ action: z.literal("agency-plan"), agencyId: z.string(), plan: z.enum(["FREE", "PREMIUM"]) }),
  z.object({ action: z.literal("unlock-all") }),
  z.object({ action: z.literal("upi-request"), requestId: z.string(), decision: z.enum(["APPROVED", "REJECTED"]) }),
]);

async function requireControlPanel(request: NextRequest) {
  const session = await requireSession();
  requireRole(session, ["SUPER_ADMIN"]);
  if (!process.env.CONTROL_PANEL_PASSWORD) throw new AuthError("Control panel password is not configured", 503);
  if (!isControlPanelPasswordValid(request.headers.get("x-control-panel-password") ?? "")) {
    throw new AuthError("Invalid control panel password", 401);
  }
  return session;
}

async function seedFeatures() {
  await Promise.all(PLATFORM_FEATURES.map((feature) => prisma.featureFlag.upsert({
    where: { key: feature.key },
    update: { label: feature.label, description: feature.description, premiumOnly: feature.premiumOnly },
    create: feature,
  })));
}

export async function GET(request: NextRequest) {
  try {
    await requireControlPanel(request);
    await seedFeatures();
    const [features, agencies, upgradeRequests] = await Promise.all([
      prisma.featureFlag.findMany({ orderBy: { label: "asc" } }),
      prisma.agency.findMany({ select: { id: true, name: true, email: true, plan: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
      prisma.upgradeRequest.findMany({ where: { status: "PENDING" }, include: { agency: { select: { name: true, email: true } } }, orderBy: { createdAt: "asc" } }),
    ]);
    return NextResponse.json({ features, agencies, upgradeRequests });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireControlPanel(request);
    const body = updateSchema.parse(await request.json());

    if (body.action === "feature") {
      await prisma.featureFlag.update({ where: { key: body.key }, data: { enabled: body.enabled } });
    } else if (body.action === "agency-plan") {
      await prisma.agency.update({ where: { id: body.agencyId }, data: { plan: body.plan } });
    } else if (body.action === "unlock-all") {
      await prisma.featureFlag.updateMany({ data: { enabled: true } });
    } else {
      const requestRow = await prisma.upgradeRequest.findUnique({ where: { id: body.requestId } });
      if (!requestRow) return NextResponse.json({ error: "Upgrade request not found" }, { status: 404 });
      if (body.decision === "APPROVED") {
        await prisma.$transaction([
          prisma.upgradeRequest.update({ where: { id: body.requestId }, data: { status: "APPROVED", reviewedAt: new Date() } }),
          prisma.agency.update({ where: { id: requestRow.agencyId }, data: { plan: "PREMIUM" } }),
        ]);
      } else {
        await prisma.upgradeRequest.update({ where: { id: body.requestId }, data: { status: "REJECTED", reviewedAt: new Date() } });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
