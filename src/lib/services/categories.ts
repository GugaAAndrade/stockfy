import type { Category } from "@prisma/client";
import * as categoryDb from "@/lib/db/categories";
import { withTenant } from "@/lib/db/tenant";
import type { CategoryCreateInput } from "@/lib/validators/category";
import type { ServiceContext } from "@/lib/services/products";

export async function listCategories(ctx: ServiceContext): Promise<Category[]> {
  if (!ctx.tenantId) {
    return [];
  }
  return withTenant(ctx.tenantId, (tx) => categoryDb.listCategories(tx, ctx.tenantId!));
}

export async function createCategory(ctx: ServiceContext, input: CategoryCreateInput) {
  if (!ctx.tenantId) {
    return null;
  }
  return withTenant(ctx.tenantId, (tx) => categoryDb.createCategory(tx, ctx.tenantId!, input.name));
}
