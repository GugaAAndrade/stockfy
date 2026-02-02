"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const payload = await response.json();
    setLoading(false);

    if (!payload.ok) {
      setError(payload.error?.message ?? "Erro ao entrar");
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Bem-vindo de volta</h1>
          <p className="text-sm text-muted-foreground mt-1">Acesse sua conta StockFy</p>
        </div>

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

        <p className="text-sm text-muted-foreground mt-6 text-center">
          Ainda não tem conta?{" "}
          <Link className="text-primary font-medium hover:underline" href="/cadastro">
            Criar agora
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
