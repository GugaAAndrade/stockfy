import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { getSessionContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe";
import { hasPermission } from "@/lib/auth/permissions";
import { logAudit } from "@/lib/audit";
import { withTenant } from "@/lib/db/tenant";

export async function POST(request: NextRequest) {
  const session = await getSessionContext({ allowInactive: true });
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  if (!hasPermission(session.role, "billing:manage")) {
    return fail({ code: "FORBIDDEN", message: "Acesso restrito ao administrador" }, 403);
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
  if (!tenant) {
    return fail({ code: "TENANT_NOT_FOUND", message: "Empresa não encontrada" }, 404);
  }

  if (process.env.BILLING_BYPASS === "1") {
    await withTenant(tenant.id, (tx) =>
      logAudit(tx, {
        tenantId: tenant.id,
        userId: session.user.id,
        action: "billing.portal_bypass",
        entity: "tenant",
        entityId: tenant.id,
      })
    );
    return ok({ url: `/app/${tenant.slug}/configuracoes` });
  }

  let customerId = tenant.stripeCustomerId ?? null;
  if (!customerId) {
    const customer = await stripe().customers.create({
      name: tenant.name,
      email: session.user.email,
      metadata: { tenantId: tenant.id },
    });
    customerId = customer.id;
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin = request.headers.get("origin") ?? process.env.APP_URL ?? "http://localhost:3000";
  const portal = await stripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/app/${tenant.slug}/configuracoes`,
  });

  await withTenant(tenant.id, (tx) =>
    logAudit(tx, {
      tenantId: tenant.id,
      userId: session.user.id,
      action: "billing.portal_opened",
      entity: "tenant",
      entityId: tenant.id,
    })
  );

  return ok({ url: portal.url });
}
