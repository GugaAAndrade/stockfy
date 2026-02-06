-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "userId" TEXT;

-- Backfill with any tenant admin (if exists) to avoid nulls
UPDATE "StockMovement" SET "userId" = (
  SELECT "userId" FROM "TenantUser"
  WHERE "TenantUser"."tenantId" = "StockMovement"."tenantId"
  ORDER BY "createdAt" ASC
  LIMIT 1
);

-- Make column required
ALTER TABLE "StockMovement" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "StockMovement_tenantId_userId_idx" ON "StockMovement"("tenantId", "userId");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
