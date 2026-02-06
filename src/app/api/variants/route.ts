import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { variantCreateSchema } from "@/lib/validators/variant";
import * as variantService from "@/lib/services/variants";
import { getSessionContext } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { withTenant } from "@/lib/db/tenant";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  if (!hasPermission(session.role, "variants:write")) {
    return fail({ code: "FORBIDDEN", message: "Sem permissão" }, 403);
  }
  const productId = request.nextUrl.searchParams.get("productId") ?? undefined;
  const data = await variantService.listVariants({ tenantId: session?.tenantId }, productId);
  return ok(data);
}

export async function POST(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  const body = await request.json().catch(() => null);
  const parsed = variantCreateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      { code: "VALIDATION_ERROR", message: "Dados inválidos", details: parsed.error.flatten() },
      400
    );
  }

  try {
    const created = await variantService.createVariant({ tenantId: session?.tenantId }, parsed.data);
    if (!created) {
      return fail({ code: "NOT_FOUND", message: "Produto não encontrado" }, 404);
    }
    await withTenant(session.tenantId, (tx) =>
      logAudit(tx, {
        tenantId: session.tenantId,
        userId: session.user.id,
        action: "variant.created",
        entity: "variant",
        entityId: created.id,
        metadata: { sku: created.sku },
      })
    );
    return ok(created, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "SKU_ALREADY_EXISTS") {
      return fail({ code: "SKU_ALREADY_EXISTS", message: "SKU já existe" }, 400);
    }
    return fail({ code: "INTERNAL_ERROR", message: "Erro ao criar SKU" }, 500);
  }
}
