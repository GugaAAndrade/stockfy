import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { variantUpdateSchema } from "@/lib/validators/variant";
import * as variantService from "@/lib/services/variants";
import { getSessionContext } from "@/lib/auth/session";

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = variantUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      { code: "VALIDATION_ERROR", message: "Dados inválidos", details: parsed.error.flatten() },
      400
    );
  }

  try {
    const updated = await variantService.updateVariant({ tenantId: session?.tenantId }, id, parsed.data);
    if (!updated) {
      return fail({ code: "NOT_FOUND", message: "SKU não encontrado" }, 404);
    }
    return ok(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "SKU_CONFIRM_REQUIRED") {
      return fail({ code: "SKU_CONFIRM_REQUIRED", message: "Confirme a alteração de SKU" }, 400);
    }
    if (error instanceof Error && error.message === "SKU_ALREADY_EXISTS") {
      return fail({ code: "SKU_ALREADY_EXISTS", message: "SKU já existe" }, 400);
    }
    return fail({ code: "INTERNAL_ERROR", message: "Erro ao atualizar SKU" }, 500);
  }
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  const { id } = await context.params;
  try {
    const deleted = await variantService.deleteVariant({ tenantId: session?.tenantId }, id);
    return ok({ id: deleted.id });
  } catch {
    return fail({ code: "INTERNAL_ERROR", message: "Erro ao excluir SKU" }, 500);
  }
}
