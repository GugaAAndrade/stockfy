import type { Category } from "@prisma/client";
import * as categoryDb from "@/lib/db/categories";
import type { CategoryCreateInput } from "@/lib/validators/category";
import type { ServiceContext } from "@/lib/services/products";

export async function listCategories(ctx: ServiceContext): Promise<Category[]> {
  void ctx;
  return categoryDb.listCategories();
}

export async function createCategory(ctx: ServiceContext, input: CategoryCreateInput) {
  void ctx;
  return categoryDb.createCategory(input.name);
}
