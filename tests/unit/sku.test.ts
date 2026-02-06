import { describe, expect, it } from "vitest";
import { buildSkuBase, limitSku } from "@/lib/services/sku";

describe("sku helpers", () => {
  it("buildSkuBase monta prefixo e abreviações", () => {
    const sku = buildSkuBase({
      prefix: "stk",
      productName: "Camisa Polo Premium",
      attributes: [
        { name: "Cor", value: "Azul" },
        { name: "Tamanho", value: "Grande" },
      ],
    });
    expect(sku).toBe("STK-CAMISA-AZUL-GRAN");
  });

  it("limitSku corta valores longos", () => {
    const value = "A".repeat(40);
    expect(limitSku(value, 32)).toHaveLength(32);
  });

  it("buildSkuBase usa PROD quando não há nome", () => {
    const sku = buildSkuBase({
      prefix: "stk",
      productName: "",
      attributes: [],
    });
    expect(sku).toBe("STK-PROD");
  });

  it("limitSku não altera quando já está no limite", () => {
    const value = "A".repeat(10);
    expect(limitSku(value, 10)).toBe(value);
  });
});
