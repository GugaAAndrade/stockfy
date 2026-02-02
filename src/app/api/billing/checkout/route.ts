import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { getSessionContext } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { stripe } from "@/lib/stripe";
import { plans, type PlanKey } from "@/lib/billing/plans";

export async function POST(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  if (session.role !== "ADMIN") {
    return fail({ code: "FORBIDDEN", message: "Acesso restrito ao administrador" }, 403);
  }

  const body = await request.json().catch(() => null);
  const planKey = String(body?.plan ?? "") as PlanKey;
  const plan = plans[planKey];
  if (!plan) {
    return fail({ code: "INVALID_PLAN", message: "Plano inválido" }, 400);
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: session.tenantId } });
  if (!tenant) {
    return fail({ code: "TENANT_NOT_FOUND", message: "Empresa não encontrada" }, 404);
  }

  if (process.env.BILLING_BYPASS === "1") {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        subscriptionStatus: "active",
        priceId: plan.priceId || null,
        currentPeriodEnd: null,
      },
    });
    return ok({ url: "/app" });
  }

  if (!plan.priceId) {
    return fail({ code: "INVALID_PLAN", message: "Plano inválido" }, 400);
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

  const checkout = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${origin}/assinatura?success=1`,
    cancel_url: `${origin}/planos?canceled=1`,
    subscription_data: {
      metadata: {
        tenantId: tenant.id,
      },
    },
    metadata: {
      tenantId: tenant.id,
      plan: planKey,
    },
  });

  return ok({ url: checkout.url });
}
