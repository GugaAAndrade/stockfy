"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";
import { ProductTable, ProductRow } from "@/components/dashboard/product-table";
import { StatsChart, LineDatum, BarDatum } from "@/components/dashboard/stats-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity, ActivityItem } from "@/components/dashboard/recent-activity";
import { LiveMetrics } from "@/components/dashboard/live-metrics";

const fallbackProducts: ProductRow[] = [];
const fallbackLineData: LineDatum[] = [
  { name: "Jan", entradas: 0, saidas: 0 },
  { name: "Fev", entradas: 0, saidas: 0 },
  { name: "Mar", entradas: 0, saidas: 0 },
  { name: "Abr", entradas: 0, saidas: 0 },
  { name: "Mai", entradas: 0, saidas: 0 },
  { name: "Jun", entradas: 0, saidas: 0 },
];
const fallbackBarData: BarDatum[] = [{ name: "Outros", value: 0 }];
const fallbackActivities: ActivityItem[] = [];

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const companySlug = typeof params.companySlug === "string" ? params.companySlug : "";
  const basePath = companySlug ? `/app/${companySlug}` : "/app";
  const [summary, setSummary] = useState({
    totalStock: 0,
    lowStock: 0,
    entradasMes: 0,
    saidasMes: 0,
    entradasChange: 0,
    saidasChange: 0,
  });
  const [metrics, setMetrics] = useState({
    totalValue: 0,
    movementsToday: 0,
    rotation: 0,
    avgRestockDays: 0,
  });
  const [lineData, setLineData] = useState<LineDatum[]>(fallbackLineData);
  const [barData, setBarData] = useState<BarDatum[]>(fallbackBarData);
  const [activities, setActivities] = useState<ActivityItem[]>(fallbackActivities);
  const [products, setProducts] = useState<ProductRow[]>(fallbackProducts);

  useEffect(() => {
    const loadDashboard = async () => {
      const response = await fetch("/api/dashboard");
      const payload = await response.json().catch(() => null);
      if (payload?.ok) {
        setSummary(payload.data.summary);
        setMetrics(payload.data.metrics);
        setLineData(payload.data.charts.lineData);
        setBarData(payload.data.charts.barData);
        setActivities(payload.data.activity);
      }
    };

    const loadProducts = async () => {
      const response = await fetch("/api/products");
      const payload = await response.json().catch(() => null);
      if (payload?.ok) {
        const mapped = (payload.data as Array<{ id: string; name: string; sku: string; category: string; categoryId: string; stock: number; minStock: number; unitPrice: string | number; updatedAt: string }>).map(
          (product) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            categoryId: product.categoryId,
            stock: product.stock,
            minStock: product.minStock,
            unitPrice: Number(product.unitPrice),
            updatedAt: product.updatedAt,
          })
        );
        setProducts(mapped);
      }
    };

    loadDashboard();
    loadProducts();
  }, []);

  return (
    <DashboardShell title="Dashboard" subtitle="Visão geral do seu estoque e movimentações">
      <DashboardCards {...summary} />
      <LiveMetrics {...metrics} />
      <QuickActions />
      <StatsChart lineData={lineData} barData={barData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProductTable products={products} onAddProduct={() => router.push(`${basePath}/produtos?new=1`)} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity activities={activities} />
        </div>
      </div>
    </DashboardShell>
  );
}
