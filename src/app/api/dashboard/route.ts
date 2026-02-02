import { ok } from "@/lib/api/response";
import { getCharts, getDashboardSummary, getLiveMetrics, getRecentActivity } from "@/lib/services/dashboard";

export async function GET() {
  const [summary, metrics, charts, activity] = await Promise.all([
    getDashboardSummary(),
    getLiveMetrics(),
    getCharts(),
    getRecentActivity(),
  ]);

  return ok({ summary, metrics, charts, activity });
}
