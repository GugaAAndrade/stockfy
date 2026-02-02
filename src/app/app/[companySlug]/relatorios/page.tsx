"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatsChart } from "@/components/dashboard/stats-chart";

const lineData = [
  { name: "Jan", entradas: 0, saidas: 0 },
  { name: "Fev", entradas: 0, saidas: 0 },
  { name: "Mar", entradas: 0, saidas: 0 },
  { name: "Abr", entradas: 0, saidas: 0 },
  { name: "Mai", entradas: 0, saidas: 0 },
  { name: "Jun", entradas: 0, saidas: 0 },
];

const barData = [{ name: "Outros", value: 0 }];

export default function ReportsPage() {
  return (
    <DashboardShell title="Relatórios" subtitle="Gere análises e indicadores do estoque">
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">Relatório Geral</h3>
          <p className="text-sm text-muted-foreground mt-1">Selecione o período e exporte o relatório.</p>
          <div className="mt-4 flex gap-3">
            <button className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition-colors">
              Exportar PDF
            </button>
            <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium">
              Gerar Relatório
            </button>
          </div>
        </div>
        <StatsChart lineData={lineData} barData={barData} />
      </div>
    </DashboardShell>
  );
}
