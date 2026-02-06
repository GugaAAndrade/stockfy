import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { resolveTenantBySlug } from "@/lib/services/tenants";
import { setTenantCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`tenant-resolve:${ip}`, 30, 60_000);
  if (!limit.allowed) {
    return fail({ code: "RATE_LIMIT", message: "Muitas tentativas. Tente novamente em instantes." }, 429);
  }

  const body = await request.json().catch(() => null);
  const raw = String(body?.slug ?? body?.company ?? "").trim();
  const normalized = raw.toLowerCase();
  if (!normalized) {
    return fail({ code: "VALIDATION_ERROR", message: "Empresa obrigatória" }, 400);
  }

  let tenant = await resolveTenantBySlug(normalized);
  if (!tenant) {
    tenant = await prisma.tenant.findFirst({
      where: { name: { equals: raw, mode: "insensitive" } },
    });
  }
  if (!tenant) {
    return fail({ code: "NOT_FOUND", message: "Empresa não encontrada" }, 404);
  }

  await setTenantCookie(tenant.id);
  return ok({ id: tenant.id, name: tenant.name, slug: tenant.slug });
}
