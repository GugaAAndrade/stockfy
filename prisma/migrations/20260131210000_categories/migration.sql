-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Add column nullable first
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;

-- Default category for existing rows
INSERT INTO "Category" ("id", "name", "createdAt", "updatedAt")
VALUES ('cat_sem_categoria', 'Sem categoria', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

UPDATE "Product"
SET "categoryId" = 'cat_sem_categoria'
WHERE "categoryId" IS NULL;

-- Enforce not null
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
