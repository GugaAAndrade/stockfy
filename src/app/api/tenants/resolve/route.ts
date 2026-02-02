import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { resolveTenantBySlug } from "@/lib/services/tenants";
import { setTenantCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
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
