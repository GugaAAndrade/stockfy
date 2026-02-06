import { ok, fail } from "@/lib/api/response";
import { stripe } from "@/lib/stripe";
import { plans, type PlanKey } from "@/lib/billing/plans";
import { log } from "@/lib/logger";

function formatPrice(amount: number | null | undefined, currency: string) {
  if (amount === null || amount === undefined) {
    return null;
  }
  const value = amount / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(value);
}

export async function GET() {
  try {
    const entries = await Promise.all(
      (Object.keys(plans) as PlanKey[]).map(async (key) => {
        const plan = plans[key];
        if (!plan.priceId) {
          return { key, name: plan.name, price: null, cadence: "/mês", items: plan.highlights };
        }
        try {
          const price = await stripe().prices.retrieve(plan.priceId);
          return {
            key,
            name: plan.name,
            price: formatPrice(price.unit_amount, price.currency) ?? null,
            cadence: price.recurring?.interval === "year" ? "/ano" : "/mês",
            items: plan.highlights,
          };
        } catch (error) {
          log("warn", "plan_price_fetch_failed", { key, error: String(error) });
          return { key, name: plan.name, price: null, cadence: "/mês", items: plan.highlights };
        }
      })
    );

    return ok(entries);
  } catch (error) {
    log("error", "plans_fetch_failed", { error: String(error) });
    return fail({ code: "PLANS_FETCH_FAILED", message: "Erro ao buscar preços" }, 500);
  }
}
