"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

type AuditRow = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    action: "",
    from: "",
    to: "",
  });

  const loadLogs = async () => {
    setError("");
    const params = new URLSearchParams();
    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }
    if (filters.action) {
      params.set("action", filters.action);
    }
    if (filters.from) {
      params.set("from", filters.from);
    }
    if (filters.to) {
      params.set("to", filters.to);
    }
    const response = await fetch(`/api/audit${params.toString() ? `?${params}` : ""}`);
    const payload = await response.json().catch(() => null);
    if (!payload?.ok) {
      setError(payload?.error?.message ?? "Erro ao carregar auditoria");
      return;
    }
    setLogs(payload.data);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <DashboardShell title="Auditoria" subtitle="Registro de ações críticas no sistema">
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Últimos 50 eventos</p>
          <button
            type="button"
            className="h-9 px-4 rounded-xl border border-border text-xs text-foreground hover:bg-muted transition-colors"
            onClick={loadLogs}
          >
            Atualizar
          </button>
        </div>

        <form
          className="grid gap-3 md:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            loadLogs();
          }}
        >
          <input
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground md:col-span-2"
            placeholder="Buscar por ação, entidade, usuário..."
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
          <select
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
            value={filters.action}
            onChange={(event) => setFilters((prev) => ({ ...prev, action: event.target.value }))}
          >
            <option value="">Todas as ações</option>
            <option value="product.created">Produto criado</option>
            <option value="product.updated">Produto atualizado</option>
            <option value="product.deleted">Produto removido</option>
            <option value="product.imported">Produtos importados</option>
            <option value="product.exported">Produtos exportados</option>
            <option value="category.created">Categoria criada</option>
            <option value="category.updated">Categoria atualizada</option>
            <option value="category.deleted">Categoria removida</option>
            <option value="variant.created">Variação criada</option>
            <option value="variant.updated">Variação atualizada</option>
            <option value="variant.deleted">Variação removida</option>
            <option value="movement.created">Movimentação criada</option>
            <option value="user.invited">Usuário convidado</option>
            <option value="user.invite_resent">Convite reenviado</option>
            <option value="user.invite_accepted">Convite aceito</option>
            <option value="user.updated">Usuário atualizado</option>
            <option value="user.deleted">Usuário removido</option>
            <option value="auth.login">Login</option>
            <option value="auth.logout">Logout</option>
            <option value="auth.register">Cadastro</option>
            <option value="billing.checkout_started">Checkout iniciado</option>
            <option value="billing.checkout_bypass">Checkout bypass</option>
            <option value="billing.portal_opened">Portal aberto</option>
            <option value="billing.portal_bypass">Portal bypass</option>
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground w-full"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
            />
            <input
              type="date"
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground w-full"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
            />
          </div>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {logs.length === 0 && !error && (
          <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
        )}

        <div className="grid gap-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-border px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-foreground font-medium">{log.action}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {log.user.name} • {log.user.email}
              </p>
              {log.entityId && (
                <p className="text-xs text-muted-foreground mt-1">
                  {log.entity} • {log.entityId}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
