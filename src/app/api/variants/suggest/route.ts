import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { variantSuggestSchema } from "@/lib/validators/variant";
import { suggestSku } from "@/lib/services/variants";
import { getSessionContext } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  const body = await request.json().catch(() => null);
  const parsed = variantSuggestSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      { code: "VALIDATION_ERROR", message: "Dados inválidos", details: parsed.error.flatten() },
      400
    );
  }

  const sku = await suggestSku({ tenantId: session.tenantId }, parsed.data);
  if (!sku) {
    return fail({ code: "NOT_FOUND", message: "Produto não encontrado" }, 404);
  }

  return ok({ sku });
}
