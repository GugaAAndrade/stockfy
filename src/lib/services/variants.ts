import * as variantDb from "@/lib/db/variants";
import { withTenant } from "@/lib/db/tenant";
import type { ServiceContext } from "@/lib/services/products";
import type { VariantCreateInput, VariantSuggestInput, VariantUpdateInput } from "@/lib/validators/variant";
import { buildSkuBase, limitSku } from "@/lib/services/sku";
import type { Prisma } from "@prisma/client";

const skuPrefix = process.env.SKU_PREFIX ?? "STK";

async function generateUniqueSku(
  client: Prisma.TransactionClient,
  tenantId: string,
  productName: string,
  attributes: Array<{ name: string; value: string }>
) {
  const base = buildSkuBase({ prefix: skuPrefix, productName, attributes });
  let seq = 1;
  // keep under 32 chars
  while (seq < 10000) {
    const candidate = limitSku(`${base}-${String(seq).padStart(3, "0")}`);
    const exists = await client.productVariant.findFirst({ where: { tenantId, sku: candidate } });
    if (!exists) {
      return candidate;
    }
    seq += 1;
  }
  throw new Error("SKU_GENERATION_FAILED");
}

export async function suggestSku(ctx: ServiceContext, input: VariantSuggestInput) {
  if (!ctx.tenantId) {
    return null;
  }
  return withTenant(ctx.tenantId, async (tx) => {
    const product = await tx.product.findFirst({
      where: { id: input.productId, tenantId: ctx.tenantId },
    });
    if (!product) {
      return null;
    }
    return generateUniqueSku(tx, ctx.tenantId!, product.name, input.attributes);
  });
}

export async function createVariant(ctx: ServiceContext, input: VariantCreateInput) {
  if (!ctx.tenantId) {
    return null;
  }

  return withTenant(ctx.tenantId, async (tx) => {
    const product = await tx.product.findFirst({ where: { id: input.productId, tenantId: ctx.tenantId } });
    if (!product) {
      return null;
    }

    const customSku = input.sku?.trim();
    if (customSku) {
      const exists = await tx.productVariant.findFirst({
        where: { tenantId: ctx.tenantId!, sku: customSku },
      });
      if (exists) {
        throw new Error("SKU_ALREADY_EXISTS");
      }
    }

    const sku =
      customSku || (await generateUniqueSku(tx, ctx.tenantId!, product.name, input.attributes));

    return variantDb.createVariant(tx, {
      tenant: { connect: { id: ctx.tenantId! } },
      product: { connect: { id: product.id } },
      sku,
      attributes: input.attributes,
      stock: input.stock,
      minStock: input.minStock,
      isDefault: false,
    });
  });
}

export async function listVariants(ctx: ServiceContext, productId?: string) {
  if (!ctx.tenantId) {
    return [];
  }
  return withTenant(ctx.tenantId, (tx) => variantDb.listVariants(tx, ctx.tenantId!, productId));
}

export async function updateVariant(ctx: ServiceContext, id: string, input: VariantUpdateInput) {
  if (!ctx.tenantId) {
    return null;
  }

  return withTenant(ctx.tenantId, async (tx) => {
    const current = await variantDb.getVariantById(tx, ctx.tenantId!, id);
    if (!current) {
      return null;
    }

    if (input.sku && input.sku !== current.sku && !input.confirmSkuChange) {
      throw new Error("SKU_CONFIRM_REQUIRED");
    }

    if (input.sku && input.sku !== current.sku) {
      const exists = await tx.productVariant.findFirst({
        where: { tenantId: ctx.tenantId!, sku: input.sku.trim() },
      });
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

    return variantDb.updateVariant(tx, id, data);
  });
}

export async function deleteVariant(ctx: ServiceContext, id: string) {
  if (!ctx.tenantId) {
    return null;
  }
  return withTenant(ctx.tenantId, (tx) => variantDb.deleteVariant(tx, id));
}
