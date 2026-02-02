export type PlanKey = "starter" | "growth" | "scale";

export const plans = {
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER ?? "",
    priceLabel: "R$ 49",
    cadence: "/mes",
    highlights: ["ate 1.000 SKUs", "1 usuario admin", "exportacao CSV"],
  },
  growth: {
    name: "Growth",
    priceId: process.env.STRIPE_PRICE_GROWTH ?? "",
    priceLabel: "R$ 149",
    cadence: "/mes",
    highlights: ["ate 10.000 SKUs", "5 usuarios", "alertas inteligentes"],
  },
  scale: {
    name: "Scale",
    priceId: process.env.STRIPE_PRICE_SCALE ?? "",
    priceLabel: "R$ 349",
    cadence: "/mes",
    highlights: ["SKUs ilimitados", "usuarios ilimitados", "suporte dedicado"],
  },
} satisfies Record<PlanKey, { name: string; priceId: string; priceLabel: string; cadence: string; highlights: string[] }>;
