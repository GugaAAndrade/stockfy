import { prisma } from "@/lib/db/prisma";
import * as variantDb from "@/lib/db/variants";
import type { VariantCreateInput, VariantSuggestInput, VariantUpdateInput } from "@/lib/validators/variant";
import { buildSkuBase, limitSku } from "@/lib/services/sku";

const skuPrefix = process.env.SKU_PREFIX ?? "STK";

async function generateUniqueSku(productName: string, attributes: Array<{ name: string; value: string }>) {
  const base = buildSkuBase({ prefix: skuPrefix, productName, attributes });
  let seq = 1;
  // keep under 32 chars
  while (seq < 10000) {
    const candidate = limitSku(`${base}-${String(seq).padStart(3, "0")}`);
    const exists = await prisma.productVariant.findUnique({ where: { sku: candidate } });
    if (!exists) {
      return candidate;
    }
    seq += 1;
  }
  throw new Error("SKU_GENERATION_FAILED");
}

export async function suggestSku(input: VariantSuggestInput) {
  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product) {
    return null;
  }
  return generateUniqueSku(product.name, input.attributes);
}

export async function createVariant(input: VariantCreateInput) {
  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product) {
    return null;
  }

  const customSku = input.sku?.trim();
  if (customSku) {
    const exists = await prisma.productVariant.findUnique({ where: { sku: customSku } });
    if (exists) {
      throw new Error("SKU_ALREADY_EXISTS");
    }
  }

  const sku = customSku || (await generateUniqueSku(product.name, input.attributes));

  return variantDb.createVariant({
    product: { connect: { id: product.id } },
    sku,
    attributes: input.attributes,
    stock: input.stock,
    minStock: input.minStock,
    isDefault: false,
  });
}

export async function listVariants(productId?: string) {
  return variantDb.listVariants(productId);
}

export async function updateVariant(id: string, input: VariantUpdateInput) {
  const current = await variantDb.getVariantById(id);
  if (!current) {
    return null;
  }

  if (input.sku && input.sku !== current.sku && !input.confirmSkuChange) {
    throw new Error("SKU_CONFIRM_REQUIRED");
  }

  if (input.sku && input.sku !== current.sku) {
    const exists = await prisma.productVariant.findUnique({ where: { sku: input.sku.trim() } });
    if (exists) {
      throw new Error("SKU_ALREADY_EXISTS");
    }
  }

  const data = {
    ...(input.attributes ? { attributes: input.attributes } : {}),
    ...(typeof input.stock === "number" ? { stock: input.stock } : {}),
    ...(typeof input.minStock === "number" ? { minStock: input.minStock } : {}),
    ...(input.sku ? { sku: input.sku.trim() } : {}),
  };

  return variantDb.updateVariant(id, data);
}

export async function deleteVariant(id: string) {
  return variantDb.deleteVariant(id);
}
