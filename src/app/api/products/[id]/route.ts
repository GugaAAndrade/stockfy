import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { productUpdateSchema } from "@/lib/validators/product";
import { getSessionUser } from "@/lib/auth/session";
import * as notificationService from "@/lib/services/notifications";
import * as productService from "@/lib/services/products";

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  const product = await productService.getProductById({}, id);
  if (!product) {
    return fail({ code: "NOT_FOUND", message: "Produto não encontrado" }, 404);
  }
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  const totalMin = product.variants.reduce((sum, variant) => sum + variant.minStock, 0);
  const defaultVariant = product.variants.find((variant) => variant.isDefault) ?? product.variants[0];
  return ok({
    ...product,
    category: product.category?.name ?? "Sem categoria",
    categoryId: product.categoryId,
    sku: defaultVariant?.sku ?? "",
    stock: totalStock,
    minStock: totalMin,
    variants: product.variants,
  });
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  const body = await request.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        details: parsed.error.flatten(),
      },
      400
    );
  }

  const updated = await productService.updateProduct({}, id, parsed.data);
  if (!updated) {
    return fail({ code: "NOT_FOUND", message: "Produto não encontrado" }, 404);
  }
  const totalStock = updated.variants?.reduce?.((sum, variant) => sum + variant.stock, 0) ?? 0;
  const totalMin = updated.variants?.reduce?.((sum, variant) => sum + variant.minStock, 0) ?? 0;
  const defaultVariant = updated.variants?.find?.((variant) => variant.isDefault) ?? updated.variants?.[0];
  await notificationService.createNotification(
    { userId: user?.id },
    "Produto atualizado",
    `Produto ${updated.name} atualizado`
  );
  return ok({
    ...updated,
    category: updated.category?.name ?? "Sem categoria",
    categoryId: updated.categoryId,
    sku: defaultVariant?.sku ?? "",
    stock: totalStock,
    minStock: totalMin,
    variants: updated.variants ?? [],
  });
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  try {
    const deleted = await productService.deleteProduct({}, id);
    await notificationService.createNotification(
      { userId: user?.id },
      "Produto excluído",
      `Produto removido do estoque`
    );
    return ok({ id: deleted.id });
  } catch {
    return fail({ code: "INTERNAL_ERROR", message: "Erro ao excluir produto" }, 500);
  }
}
