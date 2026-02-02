import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha mínima de 6 caracteres").optional(),
  role: z.enum(["ADMIN", "MANAGER", "OPERATOR"]),
  invite: z.boolean().optional(),
});

export const userUpdateSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "OPERATOR"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "INVITED"]).optional(),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
