import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/session";

const activeSubscriptionStatuses = new Set(["active", "trialing"]);

export default async function AppCompanyLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionContext({ allowInactive: true });
  if (!session) {
    redirect("/entrar");
  }

  const bypass = process.env.BILLING_BYPASS === "1";
  const status = session.tenant?.subscriptionStatus ?? "unknown";
  if (!bypass && !activeSubscriptionStatuses.has(status)) {
    redirect(`/assinatura/inativa?status=${encodeURIComponent(status)}`);
  }

  return children;
}
