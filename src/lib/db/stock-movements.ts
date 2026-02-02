import type { DbClient } from "@/lib/db/tenant";
import { Prisma } from "@prisma/client";

export function listMovements(client: DbClient, tenantId: string) {
  return client.stockMovement.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: { variant: { include: { product: true } } },
  });
}

export function createMovement(client: DbClient, data: Prisma.StockMovementCreateInput) {
  return client.stockMovement.create({ data });
}
