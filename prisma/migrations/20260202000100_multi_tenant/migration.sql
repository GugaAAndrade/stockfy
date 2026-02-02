-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'INVITED');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT,
    "priceId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantUser" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TenantUser_pkey" PRIMARY KEY ("id")
);

-- Insert default tenant
INSERT INTO "Tenant" ("id", "name", "slug", "createdAt", "updatedAt")
VALUES ('tenant_default', 'Default', 'default', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Add tenantId columns
ALTER TABLE "Category" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Product" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "StockMovement" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Notification" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Session" ADD COLUMN "tenantId" TEXT;

-- Backfill tenantId
UPDATE "Category" SET "tenantId" = 'tenant_default' WHERE "tenantId" IS NULL;
UPDATE "Product" SET "tenantId" = 'tenant_default' WHERE "tenantId" IS NULL;
UPDATE "ProductVariant" pv
SET "tenantId" = p."tenantId"
FROM "Product" p
WHERE pv."productId" = p."id";
UPDATE "StockMovement" sm
SET "tenantId" = pv."tenantId"
FROM "ProductVariant" pv
WHERE sm."variantId" = pv."id";
UPDATE "Notification" SET "tenantId" = 'tenant_default' WHERE "tenantId" IS NULL;
UPDATE "Session" SET "tenantId" = 'tenant_default' WHERE "tenantId" IS NULL;

-- Ensure tenantId is required
ALTER TABLE "Category" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "ProductVariant" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "StockMovement" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Notification" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "tenantId" SET NOT NULL;

-- Tenant unique slug
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE UNIQUE INDEX "Tenant_stripeCustomerId_key" ON "Tenant"("stripeCustomerId");
CREATE UNIQUE INDEX "Tenant_stripeSubscriptionId_key" ON "Tenant"("stripeSubscriptionId");

-- Update unique indexes
DROP INDEX IF EXISTS "Category_name_key";
DROP INDEX IF EXISTS "ProductVariant_sku_key";

CREATE UNIQUE INDEX "Category_tenantId_name_key" ON "Category"("tenantId", "name");
CREATE UNIQUE INDEX "ProductVariant_tenantId_sku_key" ON "ProductVariant"("tenantId", "sku");

-- Indexes
CREATE INDEX "Product_tenantId_categoryId_idx" ON "Product"("tenantId", "categoryId");
CREATE INDEX "Product_tenantId_createdAt_idx" ON "Product"("tenantId", "createdAt");
CREATE INDEX "ProductVariant_tenantId_productId_idx" ON "ProductVariant"("tenantId", "productId");
CREATE INDEX "StockMovement_tenantId_createdAt_idx" ON "StockMovement"("tenantId", "createdAt");
CREATE INDEX "StockMovement_tenantId_variantId_idx" ON "StockMovement"("tenantId", "variantId");
CREATE INDEX "Notification_tenantId_userId_readAt_idx" ON "Notification"("tenantId", "userId", "readAt");
CREATE INDEX "Notification_tenantId_createdAt_idx" ON "Notification"("tenantId", "createdAt");
CREATE INDEX "Session_tenantId_userId_idx" ON "Session"("tenantId", "userId");
CREATE INDEX "TenantUser_userId_idx" ON "TenantUser"("userId");

-- TenantUser uniqueness
CREATE UNIQUE INDEX "TenantUser_tenantId_userId_key" ON "TenantUser"("tenantId", "userId");

-- Create TenantUser rows for existing users
INSERT INTO "TenantUser" ("id", "tenantId", "userId", "role", "status", "createdAt", "updatedAt")
SELECT CONCAT('tenant_user_', u."id"), 'tenant_default', u."id", u."role", 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "User" u
ON CONFLICT ("tenantId", "userId") DO NOTHING;

-- Drop legacy role column
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";

-- Foreign keys
ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Product" ADD CONSTRAINT "Product_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session" ADD CONSTRAINT "Session_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Row Level Security
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductVariant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockMovement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantUser" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_category" ON "Category"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

CREATE POLICY "tenant_isolation_product" ON "Product"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

CREATE POLICY "tenant_isolation_variant" ON "ProductVariant"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

CREATE POLICY "tenant_isolation_movement" ON "StockMovement"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

CREATE POLICY "tenant_isolation_notification" ON "Notification"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

CREATE POLICY "tenant_isolation_session" ON "Session"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));

CREATE POLICY "tenant_isolation_tenantuser" ON "TenantUser"
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
