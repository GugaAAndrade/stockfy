import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { loginSchema } from "@/lib/validators/auth";
import { authenticateUser } from "@/lib/services/auth";
import { createSession, setTenantCookie } from "@/lib/auth/session";
import { resolveTenantBySlug } from "@/lib/services/tenants";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { withTenant } from "@/lib/db/tenant";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`login:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return fail({ code: "RATE_LIMIT", message: "Muitas tentativas. Tente novamente em instantes." }, 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
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

  const tenant = await resolveTenantBySlug(parsed.data.tenantSlug.toLowerCase());
  if (!tenant) {
    return fail({ code: "TENANT_NOT_FOUND", message: "Empresa não encontrada" }, 404);
  }

  try {
    const user = await authenticateUser(parsed.data, tenant.id);
    await setTenantCookie(tenant.id);
    await createSession(user.user.id, tenant.id);
    await withTenant(tenant.id, (tx) =>
      logAudit(tx, {
        tenantId: tenant.id,
        userId: user.user.id,
        action: "auth.login",
        entity: "user",
        entityId: user.user.id,
      })
    );
    return ok({ id: user.user.id, name: user.user.name, email: user.user.email, role: user.role });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_MEMBERSHIP") {
      return fail({ code: "NO_ACCESS", message: "Sem acesso a esta empresa" }, 403);
    }
    return fail({ code: "INVALID_CREDENTIALS", message: "Email, senha ou empresa inválidos" }, 401);
  }
}
