import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha mínima de 6 caracteres"),
  tenantName: z.string().min(2, "Empresa obrigatória"),
  tenantSlug: z
    .string()
    .min(2, "ID obrigatório")
    .max(32, "ID máximo de 32 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
});

export const loginSchema = z.object({
  tenantSlug: z
    .string()
    .min(2, "ID obrigatório")
    .max(32, "ID máximo de 32 caracteres")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen"),
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
