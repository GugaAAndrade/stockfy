import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { categoryCreateSchema } from "@/lib/validators/category";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import * as notificationService from "@/lib/services/notifications";

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  const body = await request.json().catch(() => null);
  const parsed = categoryCreateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      { code: "VALIDATION_ERROR", message: "Dados inválidos", details: parsed.error.flatten() },
      400
    );
  }

  const updated = await prisma.category.update({
    where: { id },
    data: { name: parsed.data.name },
  });

  await notificationService.createNotification(
    { userId: user?.id },
    "Categoria atualizada",
    `Categoria renomeada para ${updated.name}`
  );
  return ok(updated);
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  const user = await getSessionUser();

  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return fail(
      { code: "CATEGORY_IN_USE", message: "Categoria possui produtos vinculados" },
      409
    );
  }

  const deleted = await prisma.category.delete({ where: { id } });
  await notificationService.createNotification(
    { userId: user?.id },
    "Categoria excluída",
    "Categoria removida do sistema"
  );
  return ok({ id: deleted.id });
}
