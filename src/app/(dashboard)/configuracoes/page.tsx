"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function SettingsPage() {
  return (
    <DashboardShell title="Configurações" subtitle="Preferências e gestão de acesso">
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Roles disponíveis</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Admin: acesso total. Gerente: gestão de produtos e relatórios. Operador: operações de estoque.
          </p>
        </div>
        <div className="border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Gestão de usuários será adicionada na próxima etapa.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
