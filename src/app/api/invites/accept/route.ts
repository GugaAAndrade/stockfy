import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ok, fail } from "@/lib/api/response";
import { inviteAcceptSchema } from "@/lib/validators/invite";
import { verifyInviteToken } from "@/lib/auth/invite";
import { withTenant } from "@/lib/db/tenant";
import { createSession, setTenantCookie } from "@/lib/auth/session";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`invite-accept:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return fail({ code: "RATE_LIMIT", message: "Muitas tentativas. Tente novamente em instantes." }, 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = inviteAcceptSchema.safeParse(body);
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

  const tokenData = verifyInviteToken(parsed.data.token);
  if (!tokenData) {
    return fail({ code: "INVALID_TOKEN", message: "Convite inválido ou expirado" }, 400);
  }

  const now = new Date();
  const { tenantId, userId, expiresAt } = tokenData;
  if (expiresAt < now) {
    return fail({ code: "EXPIRED", message: "Convite expirado" }, 400);
  }

  try {
    const result = await withTenant(tenantId, async (tx) => {
      const membership = await tx.tenantUser.findFirst({
        where: { tenantId, userId },
        include: { tenant: true, user: true },
      });
      if (!membership) {
        throw new Error("INVITE_NOT_FOUND");
      }
      if (membership.status === "ACTIVE") {
        throw new Error("ALREADY_ACTIVE");
      }
      if (membership.inviteExpiresAt && membership.inviteExpiresAt < now) {
        throw new Error("EXPIRED");
      }

      const passwordHash = await bcrypt.hash(parsed.data.password, 10);
      await tx.user.update({
        where: { id: userId },
        data: {
          password: passwordHash,
          ...(parsed.data.name ? { name: parsed.data.name } : {}),
        },
      });

      await tx.tenantUser.update({
        where: { tenantId_userId: { tenantId, userId } },
        data: {
          status: "ACTIVE",
          inviteExpiresAt: null,
        },
      });

      return { tenantSlug: membership.tenant.slug, userId: membership.user.id };
    });

    await withTenant(tenantId, (tx) =>
      logAudit(tx, {
        tenantId,
        userId,
        action: "user.invite_accepted",
        entity: "user",
        entityId: userId,
      })
    );

    await setTenantCookie(tenantId);
    await createSession(result.userId, tenantId);

    return ok({ tenantSlug: result.tenantSlug });
  } catch (error) {
    if (error instanceof Error && error.message === "INVITE_NOT_FOUND") {
      return fail({ code: "INVITE_NOT_FOUND", message: "Convite não encontrado" }, 404);
    }
    if (error instanceof Error && error.message === "ALREADY_ACTIVE") {
      return fail({ code: "ALREADY_ACTIVE", message: "Convite já foi aceito" }, 409);
    }
    if (error instanceof Error && error.message === "EXPIRED") {
      return fail({ code: "EXPIRED", message: "Convite expirado" }, 400);
    }
    return fail({ code: "INTERNAL_ERROR", message: "Erro interno" }, 500);
  }
}
