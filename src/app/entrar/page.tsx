"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";

export default function EntrarPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = slug.trim();
    if (!normalized) {
      setError("Informe o ID da empresa");
      return;
    }
    const response = await fetch("/api/tenants/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: normalized }),
    });
    const payload = await response.json().catch(() => null);
    if (!payload?.ok) {
      setError(payload?.error?.message ?? "Empresa não encontrada");
      return;
    }
    router.push(`/entrar/${payload.data.slug}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Entrar no Stockfy</h1>
          <p className="text-sm text-muted-foreground mt-1">Informe o ID da empresa para continuar</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-foreground">Empresa</label>
            <input
              type="text"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="mt-2 w-full h-11 rounded-xl border border-border bg-background px-4 text-foreground focus:border-primary outline-none"
              placeholder="ID ou nome"
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              Voce pode usar o ID (slug) ou o nome da empresa.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Continuar
          </button>
        </form>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          Ainda não tem empresa?{" "}
          <Link className="text-primary font-medium hover:underline" href="/planos">
            Ver planos
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
