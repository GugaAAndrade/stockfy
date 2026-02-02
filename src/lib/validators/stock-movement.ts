import { z } from "zod";

export const movementCreateSchema = z.object({
  variantId: z.string().min(1),
  type: z.enum(["IN", "OUT"]),
  quantity: z.coerce.number().int().positive(),
  note: z.string().max(300).optional(),
});

export type MovementCreateInput = z.infer<typeof movementCreateSchema>;
