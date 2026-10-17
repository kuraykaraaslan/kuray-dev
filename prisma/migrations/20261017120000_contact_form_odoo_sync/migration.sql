-- AlterTable: existing rows pre-date the Odoo integration and are never pushed, so they start as SKIPPED
ALTER TABLE "ContactForm" ADD COLUMN "odooSyncStatus" TEXT NOT NULL DEFAULT 'SKIPPED',
ADD COLUMN "odooLeadId" INTEGER,
ADD COLUMN "odooSyncAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "odooSyncError" TEXT,
ADD COLUMN "odooSyncedAt" TIMESTAMP(3);

-- New rows start as PENDING
ALTER TABLE "ContactForm" ALTER COLUMN "odooSyncStatus" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "ContactForm_odooSyncStatus_createdAt_idx" ON "ContactForm"("odooSyncStatus", "createdAt");
