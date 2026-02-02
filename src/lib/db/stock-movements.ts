import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export function listMovements() {
  return prisma.stockMovement.findMany({
    orderBy: { createdAt: "desc" },
    include: { variant: { include: { product: true } } },
  });
}

export function createMovement(data: Prisma.StockMovementCreateInput) {
  return prisma.stockMovement.create({ data });
}
