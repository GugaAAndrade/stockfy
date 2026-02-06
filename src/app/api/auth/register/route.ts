import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { registerSchema } from "@/lib/validators/auth";
import { registerUser } from "@/lib/services/auth";
import { createSession, setTenantCookie } from "@/lib/auth/session";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { withTenant } from "@/lib/db/tenant";
import { logAudit } from "@/lib/audit";
import { log } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`register:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return fail({ code: "RATE_LIMIT", message: "Muitas tentativas. Tente novamente em instantes." }, 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
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

  try {
    const normalized = {
      ...parsed.data,
      tenantSlug: parsed.data.tenantSlug.trim().toLowerCase(),
      tenantName: parsed.data.tenantName.trim(),
    };
    const result = await registerUser(normalized);
    await setTenantCookie(result.tenant.id);
    await createSession(result.user.id, result.tenant.id);
    await withTenant(result.tenant.id, (tx) =>
      logAudit(tx, {
        tenantId: result.tenant.id,
        userId: result.user.id,
        action: "auth.register",
        entity: "tenant",
        entityId: result.tenant.id,
        metadata: { email: result.user.email },
      })
    );
    return ok(
      { id: result.user.id, name: result.user.name, email: result.user.email, role: "ADMIN" },
      201
    );
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_IN_USE") {
      return fail({ code: "EMAIL_IN_USE", message: "Email já cadastrado" }, 409);
    }
    if (error instanceof Error && error.message === "TENANT_IN_USE") {
      return fail({ code: "TENANT_IN_USE", message: "ID da empresa já existe" }, 409);
    }
    log("error", "register_failed", { error: String(error) });
    return fail({ code: "INTERNAL_ERROR", message: "Erro interno" }, 500);
  }
}
