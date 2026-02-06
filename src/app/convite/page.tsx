"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";

export default function InviteAcceptPage() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Convite inválido.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password,
        ...(name.trim() ? { name: name.trim() } : {}),
      }),
    });
    const payload = await response.json().catch(() => null);
    setLoading(false);

    if (!payload?.ok) {
      setError(payload?.error?.message ?? "Erro ao aceitar convite.");
      return;
    }

    window.location.href = `/app/${payload.data.tenantSlug}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm"
      >
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Convite</p>
          <h1 className="text-2xl font-semibold text-foreground mt-2">Aceitar convite</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Defina sua senha para acessar o painel.
          </p>
        </div>

        {!token && (
          <p className="text-sm text-destructive">
            Convite inválido. Solicite um novo convite ao administrador.
          </p>
        )}

        {token && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-foreground">Nome (opcional)</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full h-11 rounded-xl border border-border bg-background px-4 text-foreground focus:border-primary outline-none"
                placeholder="Seu nome"
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
            <div>
              <label className="text-sm text-foreground">Confirmar senha</label>
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="mt-2 w-full h-11 rounded-xl border border-border bg-background px-4 text-foreground focus:border-primary outline-none"
                placeholder="Repita a senha"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? "Ativando..." : "Ativar conta"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
