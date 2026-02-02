import { ok, fail } from "@/lib/api/response";
import { getSessionContext } from "@/lib/auth/session";
import { getCharts, getDashboardSummary, getLiveMetrics, getRecentActivity } from "@/lib/services/dashboard";

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  const [summary, metrics, charts, activity] = await Promise.all([
    getDashboardSummary({ tenantId: session.tenantId }),
    getLiveMetrics({ tenantId: session.tenantId }),
    getCharts({ tenantId: session.tenantId }),
    getRecentActivity({ tenantId: session.tenantId }),
  ]);

  return ok({ summary, metrics, charts, activity });
}
