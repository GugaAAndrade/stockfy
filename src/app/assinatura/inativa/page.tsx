"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";

const statusLabels: Record<string, string> = {
  active: "Ativa",
  trialing: "Em teste",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
  unpaid: "Pagamento falhou",
  incomplete: "Pagamento pendente",
  incomplete_expired: "Pagamento expirado",
  paused: "Pausada",
  unknown: "Indefinida",
};

export default function AssinaturaInativaPage() {
  const params = useSearchParams();
  const status = (params.get("status") ?? "unknown").toLowerCase();
  const [message, setMessage] = useState("");
  const label = statusLabels[status] ?? statusLabels.unknown;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm text-center space-y-4"
      >
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Assinatura</p>
          <h1 className="text-2xl font-semibold text-foreground">Acesso bloqueado</h1>
          <p className="text-sm text-muted-foreground">
            Sua assinatura está <strong className="text-foreground">{label}</strong>. Para voltar a usar o
            painel, atualize o pagamento ou escolha um plano.
          </p>
        </div>

        {message && <p className="text-xs text-destructive">{message}</p>}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            onClick={async () => {
              setMessage("");
              const response = await fetch("/api/billing/portal", { method: "POST" });
              const payload = await response.json().catch(() => null);
              if (!payload?.ok) {
                setMessage(payload?.error?.message ?? "Erro ao abrir o portal");
                return;
              }
              window.location.href = payload.data.url;
            }}
          >
            Atualizar pagamento
          </button>
          <Link
            className="w-full h-11 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors inline-flex items-center justify-center"
            href="/planos"
          >
            Ver planos
          </Link>
          <Link
            className="w-full h-11 rounded-xl text-muted-foreground text-sm hover:underline inline-flex items-center justify-center"
            href="/entrar"
          >
            Trocar empresa
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
