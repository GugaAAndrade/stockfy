"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";

type TenantInfo = { id: string; name: string; slug: string };

export default function CompanyLoginPage() {
  const router = useRouter();
  const params = useParams();
  const companySlug = typeof params.companySlug === "string" ? params.companySlug : "";
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [tenantError, setTenantError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadTenant = async () => {
      const slug = companySlug.toLowerCase();
      const response = await fetch("/api/tenants/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const payload = await response.json().catch(() => null);
      if (!active) {
        return;
      }
      if (!payload?.ok) {
        setTenantError(payload?.error?.message ?? "Empresa não encontrada");
        setLoadingTenant(false);
        return;
      }
      setTenant(payload.data);
      setLoadingTenant(false);
    };
    loadTenant();
    return () => {
      active = false;
    };
  }, [companySlug]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantSlug: companySlug.toLowerCase(),
        email,
        password,
      }),
    });

    const payload = await response.json().catch(() => null);
    setLoading(false);

    if (!payload?.ok) {
      setError(payload?.error?.message ?? "Erro ao entrar");
      return;
    }

    router.push(`/app/${companySlug.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm"
      >
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Empresa</p>
          {loadingTenant ? (
            <p className="text-lg font-semibold text-foreground mt-2">Carregando...</p>
          ) : tenant ? (
            <p className="text-2xl font-semibold text-foreground mt-2">{tenant.name}</p>
          ) : (
            <p className="text-lg font-semibold text-destructive mt-2">{tenantError}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {tenant ? `ID: ${tenant.slug}` : "Verifique o ID e tente novamente."}
          </p>
        </div>

        {!tenant && !loadingTenant && (
          <div className="flex flex-col gap-3">
            <Link
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
              href="/entrar"
            >
              Trocar empresa
            </Link>
          </div>
        )}

        {tenant && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full h-11 rounded-xl border border-border bg-background px-4 text-foreground focus:border-primary outline-none"
                placeholder="voce@email.com"
                required
              />
            </div>

            <div>
              <label className="text-sm text-foreground">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full h-11 rounded-xl border border-border bg-background px-4 text-foreground focus:border-primary outline-none"
                placeholder="Sua senha"
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}

        <p className="text-sm text-muted-foreground mt-6 text-center">
          Sem acesso a esta empresa?{" "}
          <Link className="text-primary font-medium hover:underline" href="/entrar">
            Trocar empresa
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
