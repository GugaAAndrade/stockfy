import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { getSessionContext } from "@/lib/auth/session";
import { withTenant } from "@/lib/db/tenant";
import { userUpdateSchema } from "@/lib/validators/user";

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  if (session.role !== "ADMIN") {
    return fail({ code: "FORBIDDEN", message: "Acesso restrito ao administrador" }, 403);
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      { code: "VALIDATION_ERROR", message: "Dados inválidos", details: parsed.error.flatten() },
      400
    );
  }

  const data = parsed.data;
  if (!data.role && !data.status) {
    return fail({ code: "NO_CHANGES", message: "Nenhuma alteração enviada" }, 400);
  }

  const updated = await withTenant(session.tenantId, (tx) =>
    tx.tenantUser.update({
      where: { tenantId_userId: { tenantId: session.tenantId, userId: id } },
      data: {
        ...(data.role ? { role: data.role } : {}),
        ...(data.status ? { status: data.status } : {}),
      },
    })
  );

  return ok({ role: updated.role, status: updated.status });
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  if (session.role !== "ADMIN") {
    return fail({ code: "FORBIDDEN", message: "Acesso restrito ao administrador" }, 403);
  }

  const { id } = await context.params;
  if (id === session.user.id) {
    return fail({ code: "CANNOT_REMOVE_SELF", message: "Não é possível remover seu próprio acesso" }, 400);
  }

  await withTenant(session.tenantId, async (tx) => {
    await tx.session.deleteMany({ where: { userId: id, tenantId: session.tenantId } });
    await tx.tenantUser.delete({
      where: { tenantId_userId: { tenantId: session.tenantId, userId: id } },
    });
  });

  return ok({ id });
}
