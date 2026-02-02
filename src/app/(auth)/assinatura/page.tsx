"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";

export default function AssinaturaPage() {
  const params = useSearchParams();
  const success = params.get("success") === "1";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm text-center"
      >
        <h1 className="text-2xl font-semibold text-foreground">
          {success ? "Assinatura confirmada" : "Assinatura nao concluida"}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {success
            ? "Seu pagamento foi confirmado. Voce ja pode acessar o painel."
            : "Nao conseguimos finalizar sua assinatura. Tente novamente."}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
            href="/entrar"
          >
            Entrar
          </Link>
          <Link
            className="w-full h-11 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors inline-flex items-center justify-center"
            href="/planos"
          >
            Ver planos
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
