import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export function listProducts(search?: string) {
  return prisma.product.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { category: { name: { contains: search, mode: "insensitive" } } },
            { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
  });
}

export function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id }, include: { category: true, variants: true } });
}

export function createProduct(data: Prisma.ProductCreateInput) {
  return prisma.product.create({ data });
}

export function updateProduct(id: string, data: Prisma.ProductUpdateInput) {
  return prisma.product.update({
    where: { id },
    data,
    include: { category: true, variants: true },
  });
}

export function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}
