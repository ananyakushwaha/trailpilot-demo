CREATE TYPE "UpgradeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "upgrade_requests" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "upiReference" TEXT NOT NULL,
    "note" TEXT,
    "status" "UpgradeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "upgrade_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "upgrade_requests_agencyId_status_idx" ON "upgrade_requests"("agencyId", "status");
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
