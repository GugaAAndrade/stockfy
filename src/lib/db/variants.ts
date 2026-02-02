import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export function listVariants(productId?: string) {
  return prisma.productVariant.findMany({
    where: productId ? { productId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });
}

export function createVariant(data: Prisma.ProductVariantCreateInput) {
  return prisma.productVariant.create({ data });
}

export function getVariantById(id: string) {
  return prisma.productVariant.findUnique({ where: { id }, include: { product: true } });
}

export function updateVariant(id: string, data: Prisma.ProductVariantUpdateInput) {
  return prisma.productVariant.update({ where: { id }, data });
}

export function deleteVariant(id: string) {
  return prisma.productVariant.delete({ where: { id } });
}
