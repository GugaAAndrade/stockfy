import type { DbClient } from "@/lib/db/tenant";
import { Prisma } from "@prisma/client";

export function listProducts(client: DbClient, tenantId: string, search?: string) {
  return client.product.findMany({
    where: {
      tenantId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { category: { name: { contains: search, mode: "insensitive" } } },
              { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
  });
}

export function getProductById(client: DbClient, tenantId: string, id: string) {
  return client.product.findFirst({
    where: { id, tenantId },
    include: { category: true, variants: true },
  });
}

export function createProduct(client: DbClient, data: Prisma.ProductCreateInput) {
  return client.product.create({ data });
}

export function updateProduct(client: DbClient, id: string, data: Prisma.ProductUpdateInput) {
  return client.product.update({
    where: { id },
    data,
    include: { category: true, variants: true },
  });
}

export function deleteProduct(client: DbClient, id: string) {
  return client.product.delete({ where: { id } });
}
