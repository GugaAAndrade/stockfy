import { prisma } from "@/lib/db/prisma";

export async function resolveTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({ where: { slug } });
}
