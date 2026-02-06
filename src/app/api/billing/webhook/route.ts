import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db/prisma";
import type Stripe from "stripe";

function toDate(seconds?: number | null) {
  if (!seconds) {
    return null;
  }
  return new Date(seconds * 1000);
}

async function updateTenantSubscription(tenantId: string, data: {
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
  priceId?: string | null;
  currentPeriodEnd?: Date | null;
}) {
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ...(data.stripeSubscriptionId !== undefined ? { stripeSubscriptionId: data.stripeSubscriptionId } : {}),
      ...(data.subscriptionStatus !== undefined ? { subscriptionStatus: data.subscriptionStatus } : {}),
      ...(data.priceId !== undefined ? { priceId: data.priceId } : {}),
      ...(data.currentPeriodEnd !== undefined ? { currentPeriodEnd: data.currentPeriodEnd } : {}),
    },
  });
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return new Response("Webhook signature missing", { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    return new Response("Webhook signature invalid", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = session?.metadata?.tenantId;
      const subscriptionId = session?.subscription;
      if (tenantId && subscriptionId && typeof subscriptionId === "string") {
        const subscription = await stripe().subscriptions.retrieve(subscriptionId);
        await updateTenantSubscription(tenantId, {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          priceId: subscription.items.data[0]?.price?.id ?? null,
          currentPeriodEnd: toDate(subscription.current_period_end),
        });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const tenantId = subscription?.metadata?.tenantId;
      if (tenantId) {
        await updateTenantSubscription(tenantId, {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          priceId: subscription.items.data[0]?.price?.id ?? null,
          currentPeriodEnd: toDate(subscription.current_period_end),
        });
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice?.subscription;
      if (subscriptionId && typeof subscriptionId === "string") {
        const subscription = await stripe().subscriptions.retrieve(subscriptionId);
        const tenantId = subscription?.metadata?.tenantId;
        if (tenantId) {
          await updateTenantSubscription(tenantId, {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            priceId: subscription.items.data[0]?.price?.id ?? null,
            currentPeriodEnd: toDate(subscription.current_period_end),
          });
        }
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice?.subscription;
      if (subscriptionId && typeof subscriptionId === "string") {
        const subscription = await stripe().subscriptions.retrieve(subscriptionId);
        const tenantId = subscription?.metadata?.tenantId;
        if (tenantId) {
          await updateTenantSubscription(tenantId, {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            priceId: subscription.items.data[0]?.price?.id ?? null,
            currentPeriodEnd: toDate(subscription.current_period_end),
          });
        }
      }
      break;
    }
    default:
      break;
  }

  return new Response("ok", { status: 200 });
}
