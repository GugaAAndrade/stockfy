import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function stripe() {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: "2024-06-20",
    });
  }
  return stripeInstance;
}
