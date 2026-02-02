import { prisma } from "@/lib/db/prisma";

export function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export function createCategory(name: string) {
  return prisma.category.create({ data: { name } });
}
