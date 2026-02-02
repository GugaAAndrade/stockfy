import type { DbClient } from "@/lib/db/tenant";
import { Prisma } from "@prisma/client";

export function listVariants(client: DbClient, tenantId: string, productId?: string) {
  return client.productVariant.findMany({
    where: {
      tenantId,
      ...(productId ? { productId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });
}

export function createVariant(client: DbClient, data: Prisma.ProductVariantCreateInput) {
  return client.productVariant.create({ data });
}

export function getVariantById(client: DbClient, tenantId: string, id: string) {
  return client.productVariant.findFirst({ where: { id, tenantId }, include: { product: true } });
}

export function updateVariant(client: DbClient, id: string, data: Prisma.ProductVariantUpdateInput) {
  return client.productVariant.update({ where: { id }, data });
}

export function deleteVariant(client: DbClient, id: string) {
  return client.productVariant.delete({ where: { id } });
}
