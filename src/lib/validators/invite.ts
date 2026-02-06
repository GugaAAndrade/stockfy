import { z } from "zod";

export const inviteAcceptSchema = z.object({
  token: z.string().min(10, "Token inválido"),
  password: z.string().min(6, "Senha mínima de 6 caracteres"),
  name: z.string().min(2, "Nome obrigatório").optional(),
});

export type InviteAcceptInput = z.infer<typeof inviteAcceptSchema>;
