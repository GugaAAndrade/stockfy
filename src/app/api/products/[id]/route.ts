import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { productUpdateSchema } from "@/lib/validators/product";
import { getSessionContext } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { withTenant } from "@/lib/db/tenant";
import { logAudit } from "@/lib/audit";
import * as notificationService from "@/lib/services/notifications";
import * as productService from "@/lib/services/products";

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  if (!hasPermission(session.role, "products:write")) {
    return fail({ code: "FORBIDDEN", message: "Sem permissão" }, 403);
  }
  const product = await productService.getProductById({ tenantId: session?.tenantId }, id);
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
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
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

  const updated = await productService.updateProduct({ tenantId: session?.tenantId }, id, parsed.data);
  if (!updated) {
    return fail({ code: "NOT_FOUND", message: "Produto não encontrado" }, 404);
  }
  await withTenant(session.tenantId, (tx) =>
    logAudit(tx, {
      tenantId: session.tenantId,
      userId: session.user.id,
      action: "product.updated",
      entity: "product",
      entityId: updated.id,
      metadata: { name: updated.name },
    })
  );
  const totalStock = updated.variants?.reduce?.((sum, variant) => sum + variant.stock, 0) ?? 0;
  const totalMin = updated.variants?.reduce?.((sum, variant) => sum + variant.minStock, 0) ?? 0;
  const defaultVariant = updated.variants?.find?.((variant) => variant.isDefault) ?? updated.variants?.[0];
  await notificationService.createNotification(
    { userId: session?.user.id, tenantId: session?.tenantId },
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
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  if (!hasPermission(session.role, "products:delete")) {
    return fail({ code: "FORBIDDEN", message: "Sem permissão" }, 403);
  }
  try {
    const deleted = await productService.deleteProduct({ tenantId: session?.tenantId }, id);
    await withTenant(session.tenantId, (tx) =>
      logAudit(tx, {
        tenantId: session.tenantId,
        userId: session.user.id,
        action: "product.deleted",
        entity: "product",
        entityId: deleted.id,
        metadata: { name: deleted.name },
      })
    );
    await notificationService.createNotification(
      { userId: session?.user.id, tenantId: session?.tenantId },
      "Produto excluído",
      `Produto removido do estoque`
    );
    return ok({ id: deleted.id });
  } catch {
    return fail({ code: "INTERNAL_ERROR", message: "Erro ao excluir produto" }, 500);
  }
}
