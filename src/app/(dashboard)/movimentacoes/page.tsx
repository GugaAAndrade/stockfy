"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { motion } from "motion/react";

interface MovementRow {
  id: string;
  type: "IN" | "OUT";
  quantity: number;
  note?: string | null;
  createdAt: string;
  variant: { id: string; sku: string; attributes: Array<{ name: string; value: string }>; product: { id: string; name: string } };
}

export default function MovementsPage() {
  const searchParams = useSearchParams();
  const preferredType = searchParams.get("type") === "out" ? "OUT" : "IN";

  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [variants, setVariants] = useState<
    Array<{ id: string; sku: string; attributes: Array<{ name: string; value: string }>; product: { id: string; name: string } }>
  >([]);
  const [form, setForm] = useState({ variantId: "", type: preferredType, quantity: "", note: "" });
  const [message, setMessage] = useState("");

  const loadMovements = async () => {
    const response = await fetch("/api/stock-movements");
    const payload = await response.json();
    if (payload?.ok) {
      setMovements(payload.data);
    }
  };

  const loadVariants = async () => {
    const response = await fetch("/api/variants");
    const payload = await response.json().catch(() => null);
    if (payload?.ok) {
      setVariants(payload.data);
    }
  };

  useEffect(() => {
    loadMovements();
    loadVariants();
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, type: preferredType }));
  }, [preferredType]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/stock-movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantId: form.variantId,
        type: form.type,
        quantity: Number(form.quantity),
        note: form.note || undefined,
      }),
    });

    const payload = await response.json();
    if (!payload.ok) {
      setMessage(payload.error?.message ?? "Erro ao registrar movimentação");
      return;
    }

    setMessage("Movimentação registrada com sucesso");
    setForm({ variantId: "", type: preferredType, quantity: "", note: "" });
    loadMovements();
  };

  return (
    <DashboardShell title="Movimentações" subtitle="Controle de entradas e saídas de estoque">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground">Últimas movimentações</h3>
          <div className="mt-4 space-y-3">
            {movements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20">
                <div>
                  <p className="text-sm font-medium text-foreground">{movement.variant?.product?.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {movement.variant?.sku}</p>
                  <p className="text-xs text-muted-foreground">{movement.type === "IN" ? "Entrada" : "Saída"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{movement.quantity} un</p>
                  <p className="text-xs text-muted-foreground">{new Date(movement.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground">Registrar movimentação</h3>
          <p className="text-sm text-muted-foreground mt-1">Entrada ou saída de estoque</p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <select
              className="w-full h-10 rounded-xl border border-border bg-background px-3"
              value={form.variantId}
              onChange={(event) => setForm((prev) => ({ ...prev, variantId: event.target.value }))}
              required
            >
              <option value="">Selecione o SKU</option>
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.product.name} · {variant.sku}
                </option>
              ))}
            </select>
            <select
              className="w-full h-10 rounded-xl border border-border bg-background px-3"
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as "IN" | "OUT" }))}
            >
              <option value="IN">Entrada</option>
              <option value="OUT">Saída</option>
            </select>
            <input
              className="w-full h-10 rounded-xl border border-border bg-background px-3"
              placeholder="Quantidade"
              value={form.quantity}
              onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
              required
            />
            <input
              className="w-full h-10 rounded-xl border border-border bg-background px-3"
              placeholder="Observação (opcional)"
              value={form.note}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            />
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Registrar
            </button>
          </form>
        </motion.div>
      </div>
    </DashboardShell>
  );
}
