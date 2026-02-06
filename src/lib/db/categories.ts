import type { DbClient } from "@/lib/db/tenant";

export function listCategories(client: DbClient, tenantId: string) {
  return client.category.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
}

export function createCategory(client: DbClient, tenantId: string, name: string) {
  return client.category.create({
    data: {
      name,
      tenant: { connect: { id: tenantId } },
    },
  });
}
