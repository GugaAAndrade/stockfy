import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { getSessionContext } from "@/lib/auth/session";
import { withTenant } from "@/lib/db/tenant";
import { createInviteToken } from "@/lib/auth/invite";
import { logAudit } from "@/lib/audit";
import { hasPermission } from "@/lib/auth/permissions";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  if (!hasPermission(session.role, "users:manage")) {
    return fail({ code: "FORBIDDEN", message: "Acesso restrito ao administrador" }, 403);
  }

  const userId = params.id;
  const origin = request.headers.get("origin") ?? process.env.APP_URL ?? "http://localhost:3000";
  const ttlDays = Number(process.env.INVITE_TOKEN_TTL_DAYS ?? "7");
  const inviteExpiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  try {
    const result = await withTenant(session.tenantId, async (tx) => {
      const membership = await tx.tenantUser.findFirst({
        where: { tenantId: session.tenantId, userId },
        include: { user: true },
      });
      if (!membership) {
        return null;
      }
      if (membership.status === "ACTIVE") {
        throw new Error("ALREADY_ACTIVE");
      }
      const updated = await tx.tenantUser.update({
        where: { tenantId_userId: { tenantId: session.tenantId, userId } },
        data: {
          status: "INVITED",
          invitedAt: new Date(),
          inviteExpiresAt,
        },
      });
      return { membership: updated, user: membership.user };
    });

    if (!result) {
      return fail({ code: "NOT_FOUND", message: "Convite não encontrado" }, 404);
    }

    const inviteUrl = `${origin}/convite?token=${createInviteToken(session.tenantId, userId, inviteExpiresAt)}`;

    await withTenant(session.tenantId, (tx) =>
      logAudit(tx, {
        tenantId: session.tenantId,
        userId: session.user.id,
        action: "user.invite_resent",
        entity: "user",
        entityId: userId,
        metadata: { email: result.user.email },
      })
    );

    return ok({
      id: result.user.id,
      email: result.user.email,
      status: result.membership.status,
      inviteUrl,
      inviteExpiresAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_ACTIVE") {
      return fail({ code: "ALREADY_ACTIVE", message: "Usuário já está ativo" }, 400);
    }
    return fail({ code: "INTERNAL_ERROR", message: "Erro interno" }, 500);
  }
}
