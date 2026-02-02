-- DropIndex
DROP INDEX "ProductVariant_productId_idx";

-- CreateIndex
CREATE INDEX "Category_tenantId_name_idx" ON "Category"("tenantId", "name");
