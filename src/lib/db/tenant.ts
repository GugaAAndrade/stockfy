import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type DbClient = PrismaClient | Prisma.TransactionClient;

export async function withTenant<T>(tenantId: string, fn: (tx: Prisma.TransactionClient) => Promise<T>) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    return fn(tx);
  });
}
