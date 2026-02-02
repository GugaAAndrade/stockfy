"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";

type AccountInfo = {
  name: string;
  email: string;
  role: string;
  tenant?: { id: string; name: string; slug: string } | null;
  id?: string;
};

export default function SettingsPage() {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [users, setUsers] = useState<
    Array<{ id: string; name: string; email: string; role: string; status: string; createdAt: string }>
  >([]);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "OPERATOR" });
  const [userError, setUserError] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [billing, setBilling] = useState<{
    status: string;
    plan: string | null;
    currentPeriodEnd: string | null;
    billingBypass: boolean;
  } | null>(null);

  useEffect(() => {
    const loadAccount = async () => {
      const response = await fetch("/api/auth/me");
      const payload = await response.json().catch(() => null);
      if (payload?.ok) {
        setAccount({
          name: payload.data.name,
          email: payload.data.email,
          role: payload.data.role,
          tenant: payload.data.tenant,
          id: payload.data.id,
        });
      }
    };
    const loadBilling = async () => {
      const response = await fetch("/api/billing/status");
      const payload = await response.json().catch(() => null);
      if (payload?.ok) {
        setBilling(payload.data);
      }
    };
    const loadUsers = async () => {
      const response = await fetch("/api/users");
      const payload = await response.json().catch(() => null);
      if (payload?.ok) {
        setUsers(payload.data);
      }
    };
    loadAccount();
    loadBilling();
    loadUsers();
  }, []);

  const planLabel = billing?.plan ?? (billing?.billingBypass ? "Plano de teste" : "Indefinido");
  const statusLabel = billing?.billingBypass ? "Ativo (dev)" : billing?.status ?? "Indefinido";
  const periodEndLabel = billing?.currentPeriodEnd
    ? new Date(billing.currentPeriodEnd).toLocaleDateString("pt-BR")
    : "—";

  return (
    <DashboardShell title="Configurações" subtitle="Preferências, conta e empresa">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Empresa</h3>
            <p className="text-sm text-muted-foreground mt-1">Dados principais da empresa ativa.</p>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span className="text-muted-foreground">Nome</span>
              <span className="text-foreground font-medium">{account?.tenant?.name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span className="text-muted-foreground">Slug</span>
              <span className="text-foreground font-medium">{account?.tenant?.slug ?? "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Conta</h3>
            <p className="text-sm text-muted-foreground mt-1">Informacoes do usuario logado.</p>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span className="text-muted-foreground">Nome</span>
              <span className="text-foreground font-medium">{account?.name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground font-medium">{account?.email ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span className="text-muted-foreground">Cargo</span>
              <span className="text-foreground font-medium">
                {account?.role === "ADMIN"
                  ? "Admin"
                  : account?.role === "MANAGER"
                    ? "Gerente"
                    : account?.role === "OPERATOR"
                      ? "Operador"
                      : "—"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="w-full h-10 rounded-xl border border-border text-xs text-foreground hover:bg-muted transition-colors"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/entrar";
            }}
          >
            Sair
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Assinatura</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Status da assinatura e plano atual.
          </p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
          <span className="text-muted-foreground">Status</span>
          <span className="text-foreground font-medium">{statusLabel}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
          <span className="text-muted-foreground">Plano</span>
          <span className="text-foreground font-medium">{planLabel}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
          <span className="text-muted-foreground">Renovação</span>
          <span className="text-foreground font-medium">{periodEndLabel}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          A gestao completa de planos sera exibida aqui quando o Stripe estiver configurado.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Cargos disponíveis</h3>
        <p className="text-sm text-muted-foreground">
          Admin: acesso total. Gerente: gestão de produtos e relatórios. Operador: operações de estoque.
        </p>
        <p className="text-sm text-muted-foreground">Gestão de usuários será adicionada na próxima etapa.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Usuários da empresa</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Admins podem criar novos usuários e definir permissões.
          </p>
        </div>

        <div className="grid gap-3">
          {users.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
          )}
          {users.map((user) => (
            <div key={user.id} className="flex flex-col gap-1 rounded-xl border border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.role === "ADMIN"
                    ? "Admin"
                    : user.role === "MANAGER"
                      ? "Gerente"
                      : user.role === "OPERATOR"
                        ? "Operador"
                        : user.role}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Status:{" "}
                {user.status === "ACTIVE"
                  ? "Ativo"
                  : user.status === "INACTIVE"
                    ? "Inativo"
                    : "Convite"}
              </p>
              {account?.role === "ADMIN" && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <select
                    value={user.role}
                    onChange={async (event) => {
                      const role = event.target.value;
                      const response = await fetch(`/api/users/${user.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ role }),
                      });
                      const payload = await response.json().catch(() => null);
                      if (payload?.ok) {
                        setUsers((prev) =>
                          prev.map((item) => (item.id === user.id ? { ...item, role } : item))
                        );
                      }
                    }}
                    className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Gerente</option>
                    <option value="OPERATOR">Operador</option>
                  </select>
                  <button
                    type="button"
                    className="h-8 rounded-lg border border-border px-3 text-xs text-foreground hover:bg-muted"
                    onClick={async () => {
                      const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                      const response = await fetch(`/api/users/${user.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: nextStatus }),
                      });
                      const payload = await response.json().catch(() => null);
                      if (payload?.ok) {
                        setUsers((prev) =>
                          prev.map((item) => (item.id === user.id ? { ...item, status: nextStatus } : item))
                        );
                      }
                    }}
                  >
                    {user.status === "ACTIVE" ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    type="button"
                    disabled={account?.id === user.id}
                    className="h-8 rounded-lg border border-border px-3 text-xs text-foreground hover:bg-muted disabled:opacity-50"
                    onClick={async () => {
                      const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
                      const payload = await response.json().catch(() => null);
                      if (payload?.ok) {
                        setUsers((prev) => prev.filter((item) => item.id !== user.id));
                      }
                    }}
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {account?.role === "ADMIN" && (
          <form
            className="grid gap-3 rounded-xl border border-border p-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setUserError("");
              setUserMessage("");
              const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...userForm, invite: true }),
              });
              const payload = await response.json().catch(() => null);
              if (!payload?.ok) {
                setUserError(payload?.error?.message ?? "Erro ao criar usuário");
                return;
              }
              if (payload.data?.tempPassword) {
                setUserMessage(`Convite criado. Senha temporária: ${payload.data.tempPassword}`);
              } else {
                setUserMessage("Usuário criado com sucesso");
              }
              setUserForm({ name: "", email: "", password: "", role: "OPERATOR" });
              const refresh = await fetch("/api/users");
              const refreshPayload = await refresh.json().catch(() => null);
              if (refreshPayload?.ok) {
                setUsers(refreshPayload.data);
              }
            }}
          >
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Nome</label>
              <input
                value={userForm.name}
                onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Email</label>
              <input
                type="email"
                value={userForm.email}
                onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Senha</label>
              <div className="rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground">
                Uma senha temporária será gerada automaticamente para o convite.
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-muted-foreground">Cargo</label>
              <select
                value={userForm.role}
                onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value }))}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Gerente</option>
                <option value="OPERATOR">Operador</option>
              </select>
            </div>

            <div className="rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground">
              Criação via convite: o usuário recebe uma senha temporária e fica com status Convite.
            </div>

            {userError && <p className="text-xs text-destructive">{userError}</p>}
            {userMessage && <p className="text-xs text-success">{userMessage}</p>}

            <button
              type="submit"
              className="h-10 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
            >
              Criar usuário
            </button>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}
