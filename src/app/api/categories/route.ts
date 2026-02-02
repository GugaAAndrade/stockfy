import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { categoryCreateSchema } from "@/lib/validators/category";
import { getSessionContext } from "@/lib/auth/session";
import * as notificationService from "@/lib/services/notifications";
import * as categoryService from "@/lib/services/categories";

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  const data = await categoryService.listCategories({ tenantId: session?.tenantId });
  return ok(data);
}

export async function POST(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  const body = await request.json().catch(() => null);
  const parsed = categoryCreateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      { code: "VALIDATION_ERROR", message: "Dados inválidos", details: parsed.error.flatten() },
      400
    );
  }

  const created = await categoryService.createCategory({ tenantId: session?.tenantId }, parsed.data);
  await notificationService.createNotification(
    { userId: session?.user.id, tenantId: session?.tenantId },
    "Categoria criada",
    `Categoria ${created.name} adicionada`
  );
  return ok(created, 201);
}
