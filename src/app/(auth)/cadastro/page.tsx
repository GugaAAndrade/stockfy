"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = (searchParams.get("plan") ?? "starter").toLowerCase();
  const [name, setName] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (process.env.NEXT_PUBLIC_BILLING_BYPASS === "1") {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          tenantName,
          tenantSlug,
        }),
      });

      const payload = await response.json().catch(() => null);
      setLoading(false);

      if (!payload?.ok) {
        setError(payload?.error?.message ?? "Erro ao cadastrar");
        return;
      }

      router.push(`/app/${tenantSlug.trim().toLowerCase()}`);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        tenantName,
        tenantSlug,
      }),
    });

    const payload = await response.json();

    if (!payload.ok) {
      setLoading(false);
      setError(payload.error?.message ?? "Erro ao cadastrar");
      return;
    }

    const checkoutResponse = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    const checkoutPayload = await checkoutResponse.json();
    setLoading(false);

    if (!checkoutPayload.ok) {
      setError(checkoutPayload.error?.message ?? "Erro ao iniciar assinatura");
      router.push("/planos");
      return;
    }

    window.location.href = checkoutPayload.data.url;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Criar conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Comece a gerenciar seu estoque</p>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Plano escolhido</p>
          <p className="text-sm font-medium text-foreground mt-1">{plan.toUpperCase()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Voce sera redirecionado para pagamento apos o cadastro.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-foreground">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full h-11 rounded-xl border border-border bg-background px-4 text-foreground focus:border-primary outline-none"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label className="text-sm text-foreground">Empresa</label>
            <input
              type="text"
              value={tenantName}
              onChange={(event) => setTenantName(event.target.value)}
              className="mt-2 w-full h-11 rounded-xl border border-border bg-background px-4 text-foreground focus:border-primary outline-none"
              placeholder="Nome da empresa"
              required
            />
          </div>

          <div>
            <label className="text-sm text-foreground">ID da empresa</label>
            <input
              type="text"
              value={tenantSlug}
              onChange={(event) => setTenantSlug(event.target.value.toLowerCase())}
              className="mt-2 w-full h-11 rounded-xl border border-border bg-background px-4 text-foreground focus:border-primary outline-none"
              placeholder="ex: acme"
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use apenas letras minúsculas, números e hífen.
            </p>
          </div>

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
              placeholder="Crie uma senha"
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          Já possui conta?{" "}
          <Link className="text-primary font-medium hover:underline" href="/entrar">
            Entrar
          </Link>
        </p>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Ja tem empresa? Use o ID da empresa direto no login.
        </p>
      </motion.div>
    </div>
  );
}
