import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { categoryCreateSchema } from "@/lib/validators/category";
import { getSessionContext } from "@/lib/auth/session";
import * as notificationService from "@/lib/services/notifications";
import { withTenant } from "@/lib/db/tenant";

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  const session = await getSessionContext();
  const body = await request.json().catch(() => null);
  const parsed = categoryCreateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      { code: "VALIDATION_ERROR", message: "Dados inválidos", details: parsed.error.flatten() },
      400
    );
  }

  if (!session?.tenantId) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }

  const updated = await withTenant(session.tenantId, (tx) =>
    tx.category.update({
      where: { id },
      data: { name: parsed.data.name },
    })
  );

  await notificationService.createNotification(
    { userId: session?.user.id, tenantId: session?.tenantId },
    "Categoria atualizada",
    `Categoria renomeada para ${updated.name}`
  );
  return ok(updated);
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  const session = await getSessionContext();

  if (!session?.tenantId) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }

  const count = await withTenant(session.tenantId, (tx) =>
    tx.product.count({ where: { categoryId: id, tenantId: session.tenantId } })
  );
  if (count > 0) {
    return fail(
      { code: "CATEGORY_IN_USE", message: "Categoria possui produtos vinculados" },
      409
    );
  }

  const deleted = await withTenant(session.tenantId, (tx) => tx.category.delete({ where: { id } }));
  await notificationService.createNotification(
    { userId: session?.user.id, tenantId: session?.tenantId },
    "Categoria excluída",
    "Categoria removida do sistema"
  );
  return ok({ id: deleted.id });
}
