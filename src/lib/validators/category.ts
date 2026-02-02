import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
