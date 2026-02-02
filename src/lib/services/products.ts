import type { Product } from "@prisma/client";
import * as productDb from "@/lib/db/products";
import type { ProductCreateInput, ProductUpdateInput } from "@/lib/validators/product";
import { buildSkuBase, limitSku } from "@/lib/services/sku";
import { withTenant } from "@/lib/db/tenant";

export type ServiceContext = {
  userId?: string;
  tenantId?: string;
};

export async function listProducts(ctx: ServiceContext, search?: string): Promise<Product[]> {
  if (!ctx.tenantId) {
    return [];
  }
  return withTenant(ctx.tenantId, (tx) => productDb.listProducts(tx, ctx.tenantId!, search));
}

export async function getProductById(ctx: ServiceContext, id: string) {
  if (!ctx.tenantId) {
    return null;
  }
  return withTenant(ctx.tenantId, (tx) => productDb.getProductById(tx, ctx.tenantId!, id));
}

export async function createProduct(ctx: ServiceContext, input: ProductCreateInput) {
  if (!ctx.tenantId) {
    return null;
  }
  const skuPrefix = process.env.SKU_PREFIX ?? "STK";
  const base = buildSkuBase({ prefix: skuPrefix, productName: input.name, attributes: [] });
  let seq = 1;
  let candidate = limitSku(`${base}-${String(seq).padStart(3, "0")}`);
  return withTenant(ctx.tenantId, async (tx) => {
    while (await tx.productVariant.findFirst({ where: { tenantId: ctx.tenantId!, sku: candidate } })) {
      seq += 1;
      candidate = limitSku(`${base}-${String(seq).padStart(3, "0")}`);
    }

    const product = await tx.product.create({
      data: {
        tenantId: ctx.tenantId!,
        name: input.name,
        description: input.description,
        category: { connect: { id: input.categoryId } },
        unitPrice: input.unitPrice,
      },
    });

    await tx.productVariant.create({
      data: {
        tenantId: ctx.tenantId!,
        productId: product.id,
        sku: candidate,
        attributes: [],
        stock: input.stock,
        minStock: input.minStock,
        isDefault: true,
      },
    });

    return product;
  });
}

export async function updateProduct(ctx: ServiceContext, id: string, input: ProductUpdateInput) {
  if (!ctx.tenantId) {
    return null;
  }
  const data = { ...input } as Record<string, unknown>;
  if (input.categoryId) {
    data.category = { connect: { id: input.categoryId } };
    delete data.categoryId;
  }
  const { stock, minStock } = input;
  delete (data as { stock?: number }).stock;
  delete (data as { minStock?: number }).minStock;

  return withTenant(ctx.tenantId, async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data: data as ProductUpdateInput,
      include: { category: true, variants: true },
    });

    if (typeof stock === "number" || typeof minStock === "number") {
      const defaultVariant =
        product.variants.find((variant) => variant.isDefault) ?? product.variants[0];
      if (defaultVariant) {
        await tx.productVariant.update({
          where: { id: defaultVariant.id },
          data: {
            ...(typeof stock === "number" ? { stock } : {}),
            ...(typeof minStock === "number" ? { minStock } : {}),
          },
        });
      }
    }

    return tx.product.findUnique({
      where: { id: product.id },
      include: { category: true, variants: true },
    });
  });
}

export async function deleteProduct(ctx: ServiceContext, id: string) {
  if (!ctx.tenantId) {
    return null;
  }
  return withTenant(ctx.tenantId, (tx) => productDb.deleteProduct(tx, id));
}
