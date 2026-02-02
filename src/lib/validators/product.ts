import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().max(500).optional(),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  unitPrice: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  minStock: z.coerce.number().int().nonnegative(),
});

export const productUpdateSchema = productCreateSchema.partial();

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
