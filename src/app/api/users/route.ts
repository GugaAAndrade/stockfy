import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { getSessionContext } from "@/lib/auth/session";
import { withTenant } from "@/lib/db/tenant";
import { userCreateSchema } from "@/lib/validators/user";
import bcrypt from "bcryptjs";
import { createInviteToken } from "@/lib/auth/invite";
import { logAudit } from "@/lib/audit";
import { hasPermission } from "@/lib/auth/permissions";

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }

  const members = await withTenant(session.tenantId, (tx) =>
    tx.tenantUser.findMany({
      where: { tenantId: session.tenantId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    })
  );

  const data = members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    role: member.role,
    status: member.status,
    createdAt: member.createdAt,
    inviteExpiresAt: member.inviteExpiresAt,
  }));

  return ok(data);
}

export async function POST(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  if (!hasPermission(session.role, "users:manage")) {
    return fail({ code: "FORBIDDEN", message: "Acesso restrito ao administrador" }, 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      { code: "VALIDATION_ERROR", message: "Dados inválidos", details: parsed.error.flatten() },
      400
    );
  }

  const input = parsed.data;
  const invite = input.invite === true;
  const password = input.password;
  if (!invite && !password) {
    return fail({ code: "PASSWORD_REQUIRED", message: "Senha obrigatória" }, 400);
  }

  try {
    const origin = request.headers.get("origin") ?? process.env.APP_URL ?? "http://localhost:3000";
    const ttlDays = Number(process.env.INVITE_TOKEN_TTL_DAYS ?? "7");
    const inviteExpiresAt = invite ? new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000) : null;

    const result = await withTenant(session.tenantId, async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email: input.email } });
      if (!existingUser) {
        const tempPassword =
          password ?? Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const createdUser = await tx.user.create({
          data: { name: input.name, email: input.email, password: passwordHash },
        });
        const membership = await tx.tenantUser.create({
          data: {
            tenant: { connect: { id: session.tenantId } },
            user: { connect: { id: createdUser.id } },
            role: input.role,
            status: invite ? "INVITED" : "ACTIVE",
            invitedAt: invite ? new Date() : null,
            inviteExpiresAt,
          },
        });
        return { user: createdUser, membership, tempPassword: null };
      }

      const existingMembership = await tx.tenantUser.findFirst({
        where: { tenantId: session.tenantId, userId: existingUser.id },
      });
      if (existingMembership) {
        throw new Error("USER_ALREADY_MEMBER");
      }

      const membership = await tx.tenantUser.create({
        data: {
          tenant: { connect: { id: session.tenantId } },
          user: { connect: { id: existingUser.id } },
          role: input.role,
          status: invite ? "INVITED" : "ACTIVE",
          invitedAt: invite ? new Date() : null,
          inviteExpiresAt,
        },
      });

      return { user: existingUser, membership, tempPassword: null };
    });

    await withTenant(session.tenantId, (tx) =>
      logAudit(tx, {
        tenantId: session.tenantId,
        userId: session.user.id,
        action: "user.invited",
        entity: "user",
        entityId: result.user.id,
        metadata: { email: result.user.email, role: result.membership.role },
      })
    );

    const inviteUrl =
      invite && inviteExpiresAt
        ? `${origin}/convite?token=${createInviteToken(session.tenantId, result.user.id, inviteExpiresAt)}`
        : null;

    return ok(
      {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.membership.role,
        status: result.membership.status,
        inviteUrl,
        inviteExpiresAt,
      },
      201
    );
  } catch (error) {
    if (error instanceof Error && error.message === "USER_ALREADY_MEMBER") {
      return fail({ code: "USER_ALREADY_MEMBER", message: "Usuário já pertence a esta empresa" }, 409);
    }
    return fail({ code: "INTERNAL_ERROR", message: "Erro interno" }, 500);
  }
}
