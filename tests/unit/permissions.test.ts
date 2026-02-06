import { describe, expect, it } from "vitest";
import { hasPermission } from "@/lib/auth/permissions";

describe("permissions", () => {
  it("admin pode tudo", () => {
    expect(hasPermission("ADMIN", "products:write")).toBe(true);
    expect(hasPermission("ADMIN", "users:manage")).toBe(true);
    expect(hasPermission("ADMIN", "billing:manage")).toBe(true);
  });

  it("gerente pode gerenciar estoque", () => {
    expect(hasPermission("MANAGER", "products:write")).toBe(true);
    expect(hasPermission("MANAGER", "products:delete")).toBe(true);
    expect(hasPermission("MANAGER", "categories:delete")).toBe(true);
    expect(hasPermission("MANAGER", "variants:write")).toBe(true);
    expect(hasPermission("MANAGER", "users:manage")).toBe(false);
  });

  it("operador só movimentações", () => {
    expect(hasPermission("OPERATOR", "movements:write")).toBe(true);
    expect(hasPermission("OPERATOR", "products:write")).toBe(false);
  });

  it("roles desconhecidas caem para operador", () => {
    expect(hasPermission("GUEST", "movements:write")).toBe(true);
    expect(hasPermission("GUEST", "users:manage")).toBe(false);
  });
});
