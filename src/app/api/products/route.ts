import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { productCreateSchema } from "@/lib/validators/product";
import { getSessionContext } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { logAudit } from "@/lib/audit";
import { withTenant } from "@/lib/db/tenant";
import * as notificationService from "@/lib/services/notifications";
import * as productService from "@/lib/services/products";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  if (!hasPermission(session.role, "products:write")) {
    return fail({ code: "FORBIDDEN", message: "Sem permissão" }, 403);
  }
  const data = await productService.listProducts({ tenantId: session?.tenantId }, search);
  const mapped = data.map((product) => {
    const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    const totalMin = product.variants.reduce((sum, variant) => sum + variant.minStock, 0);
    const defaultVariant = product.variants.find((variant) => variant.isDefault) ?? product.variants[0];
    return {
      ...product,
      category: product.category?.name ?? "Sem categoria",
      categoryId: product.categoryId,
      sku: defaultVariant?.sku ?? "",
      stock: totalStock,
      minStock: totalMin,
      variants: product.variants,
    };
  });
  return ok(mapped);
}

export async function POST(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  const body = await request.json().catch(() => null);
  const parsed = productCreateSchema.safeParse(body);

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

  const created = await productService.createProduct({ tenantId: session?.tenantId }, parsed.data);
  if (!created) {
    return fail({ code: "NOT_FOUND", message: "Categoria inválida" }, 404);
  }
  await withTenant(session.tenantId, (tx) =>
    logAudit(tx, {
      tenantId: session.tenantId,
      userId: session.user.id,
      action: "product.created",
      entity: "product",
      entityId: created.id,
      metadata: { name: created.name },
    })
  );
  await notificationService.createNotification(
    { userId: session?.user.id, tenantId: session?.tenantId },
    "Produto cadastrado",
    `Produto ${created.name} cadastrado com sucesso`
  );
  return ok(created, 201);
}
