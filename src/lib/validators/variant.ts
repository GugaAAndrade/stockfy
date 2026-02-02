import { z } from "zod";

export const variantAttributeSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

export const variantCreateSchema = z.object({
  productId: z.string().min(1),
  attributes: z.array(variantAttributeSchema).default([]),
  stock: z.coerce.number().int().nonnegative(),
  minStock: z.coerce.number().int().nonnegative(),
  sku: z.string().min(2).optional(),
});

export const variantSuggestSchema = z.object({
  productId: z.string().min(1),
  attributes: z.array(variantAttributeSchema).default([]),
});

export const variantUpdateSchema = z.object({
  attributes: z.array(variantAttributeSchema).optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  minStock: z.coerce.number().int().nonnegative().optional(),
  sku: z.string().min(2).optional(),
  confirmSkuChange: z.boolean().optional(),
});

export type VariantCreateInput = z.infer<typeof variantCreateSchema>;
export type VariantSuggestInput = z.infer<typeof variantSuggestSchema>;
export type VariantUpdateInput = z.infer<typeof variantUpdateSchema>;
