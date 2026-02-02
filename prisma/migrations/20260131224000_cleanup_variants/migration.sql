-- Drop foreign key and column from StockMovement
ALTER TABLE "StockMovement" DROP CONSTRAINT IF EXISTS "StockMovement_productId_fkey";
ALTER TABLE "StockMovement" DROP COLUMN IF EXISTS "productId";

-- Drop legacy columns from Product
DROP INDEX IF EXISTS "Product_sku_key";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "sku";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "stock";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "minStock";
