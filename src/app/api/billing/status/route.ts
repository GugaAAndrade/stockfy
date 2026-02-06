import { ok, fail } from "@/lib/api/response";
import { getSessionContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { plans } from "@/lib/billing/plans";

function resolvePlanLabel(priceId: string | null | undefined) {
  if (!priceId) {
    return null;
  }
  const entry = Object.values(plans).find((plan) => plan.priceId === priceId);
  return entry?.name ?? null;
}

export async function GET() {
  const session = await getSessionContext({ allowInactive: true });
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
  if (!tenant) {
    return fail({ code: "TENANT_NOT_FOUND", message: "Empresa não encontrada" }, 404);
  }

  return ok({
    status: tenant.subscriptionStatus ?? "unknown",
    priceId: tenant.priceId ?? null,
    plan: resolvePlanLabel(tenant.priceId),
    currentPeriodEnd: tenant.currentPeriodEnd,
    billingBypass: process.env.BILLING_BYPASS === "1",
  });
}
