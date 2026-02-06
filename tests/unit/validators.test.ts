import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validators/auth";
import { productCreateSchema } from "@/lib/validators/product";
import { movementCreateSchema } from "@/lib/validators/stock-movement";
import { userCreateSchema } from "@/lib/validators/user";

describe("validators", () => {
  it("login valida campos obrigatórios", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "123456", tenantSlug: "acme" });
    expect(result.success).toBe(true);
  });

  it("register exige campos mínimos", () => {
    const result = registerSchema.safeParse({
      name: "Teste",
      email: "teste@teste.com",
      password: "123456",
      tenantName: "Empresa",
      tenantSlug: "empresa",
    });
    expect(result.success).toBe(true);
  });

  it("produto exige campos obrigatórios", () => {
    const result = productCreateSchema.safeParse({
      name: "Produto",
      categoryId: "cat",
      unitPrice: 10,
      stock: 5,
      minStock: 1,
    });
    expect(result.success).toBe(true);
  });

  it("movimentação exige quantidade positiva", () => {
    const valid = movementCreateSchema.safeParse({
      variantId: "var",
      type: "IN",
      quantity: 2,
    });
    const invalid = movementCreateSchema.safeParse({
      variantId: "var",
      type: "OUT",
      quantity: 0,
    });
    expect(valid.success).toBe(true);
    expect(invalid.success).toBe(false);
  });

  it("userCreate permite convite sem senha", () => {
    const result = userCreateSchema.safeParse({
      name: "Usuario",
      email: "u@x.com",
      role: "OPERATOR",
      invite: true,
      password: "",
    });
    expect(result.success).toBe(true);
  });

  it("movimentação bloqueia nota longa", () => {
    const result = movementCreateSchema.safeParse({
      variantId: "var",
      type: "IN",
      quantity: 1,
      note: "a".repeat(400),
    });
    expect(result.success).toBe(false);
  });
});
