import { prisma } from "@/lib/db/prisma";
import type { LoginInput, RegisterInput } from "@/lib/validators/auth";
import bcrypt from "bcryptjs";

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("EMAIL_IN_USE");
  }
  const password = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password,
      role: "ADMIN",
    },
  });
}

export async function authenticateUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    return null;
  }
  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    return null;
  }
  return user;
}
