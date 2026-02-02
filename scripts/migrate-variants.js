/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 12);
}

async function generateSku(productName, preferredSku) {
  if (preferredSku && preferredSku.trim().length >= 2) {
    return preferredSku.trim();
  }
  const prefix = process.env.SKU_PREFIX || "STK";
  const base = `${prefix}-${slugify(productName)}`.toUpperCase();
  let seq = 1;
  while (seq < 10000) {
    const candidate = `${base}-${String(seq).padStart(3, "0")}`.slice(0, 32);
    const exists = await prisma.productVariant.findUnique({ where: { sku: candidate } });
    if (!exists) {
      return candidate;
    }
    seq += 1;
  }
  throw new Error("SKU_GENERATION_FAILED");
}

async function main() {
  const products = await prisma.$queryRaw`
    SELECT id, name, sku, stock, "minStock"
    FROM "Product"
  `;

  for (const product of products) {
    const existing = await prisma.productVariant.findFirst({
      where: { productId: product.id },
    });
    if (existing) {
      continue;
    }

    const sku = await generateSku(product.name, product.sku);
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku,
        attributes: [],
        stock: Number(product.stock ?? 0),
        minStock: Number(product.minStock ?? 0),
        isDefault: true,
      },
    });
  }

  await prisma.$executeRawUnsafe(`
    UPDATE "StockMovement" sm
    SET "variantId" = pv.id
    FROM "ProductVariant" pv
    WHERE sm."variantId" IS NULL
      AND sm."productId" = pv."productId";
  `);

  const remaining = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM "StockMovement"
    WHERE "variantId" IS NULL
  `;

  if (remaining[0]?.count > 0) {
    throw new Error("MOVEMENTS_WITHOUT_VARIANT");
  }

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "StockMovement"
    ALTER COLUMN "variantId" SET NOT NULL;
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("OK: variantes padrão criadas e movimentações migradas.");
  })
  .catch(async (error) => {
    console.error("Erro ao migrar variantes:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
