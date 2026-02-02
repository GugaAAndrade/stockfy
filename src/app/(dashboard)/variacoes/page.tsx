"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { motion } from "motion/react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

type VariantRow = {
  id: string;
  sku: string;
  stock: number;
  minStock: number;
  attributes: Array<{ name: string; value: string }>;
  product: { id: string; name: string };
};

const emptyForm = {
  productId: "",
  sku: "",
  stock: "",
  minStock: "",
  attributes: [{ name: "", value: "" }],
};

export default function VariantsPage() {
  const searchParams = useSearchParams();
  const selectedProductId = searchParams.get("productId") ?? "";
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<VariantRow | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<VariantRow | null>(null);
  const [confirmSkuChange, setConfirmSkuChange] = useState(false);
  const { push } = useToast();

  const attributeRows = useMemo(() => form.attributes, [form.attributes]);
  const editAttributeRows = useMemo(() => editForm.attributes, [editForm.attributes]);

  const loadVariants = async () => {
    const response = await fetch("/api/variants");
    const payload = await response.json().catch(() => null);
    if (payload?.ok) {
      setVariants(payload.data);
    }
  };

  const loadProducts = async () => {
    const response = await fetch("/api/products");
    const payload = await response.json().catch(() => null);
    if (payload?.ok) {
      setProducts(payload.data.map((product: { id: string; name: string }) => ({ id: product.id, name: product.name })));
    }
  };

  useEffect(() => {
    loadVariants();
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      setForm((prev) => ({ ...prev, productId: selectedProductId }));
    }
  }, [selectedProductId]);

  const handleAttributeChange = (index: number, field: "name" | "value", value: string) => {
    setForm((prev) => {
      const next = [...prev.attributes];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, attributes: next };
    });
  };

  const handleEditAttributeChange = (index: number, field: "name" | "value", value: string) => {
    setEditForm((prev) => {
      const next = [...prev.attributes];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, attributes: next };
    });
  };

  const handleAddAttribute = () => {
    setForm((prev) => ({ ...prev, attributes: [...prev.attributes, { name: "", value: "" }] }));
  };

  const handleAddEditAttribute = () => {
    setEditForm((prev) => ({ ...prev, attributes: [...prev.attributes, { name: "", value: "" }] }));
  };

  const handleSuggestSku = async () => {
    if (!form.productId) {
      setMessage("Selecione um produto primeiro");
      return;
    }
    const response = await fetch("/api/variants/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: form.productId,
        attributes: form.attributes.filter((item) => item.name && item.value),
      }),
    });
    const payload = await response.json().catch(() => null);
    if (payload?.ok) {
      setForm((prev) => ({ ...prev, sku: payload.data.sku }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: form.productId,
        sku: form.sku || undefined,
        stock: Number(form.stock),
        minStock: Number(form.minStock),
        attributes: form.attributes.filter((item) => item.name && item.value),
      }),
    });

    const payload = await response.json().catch(() => null);
    setLoading(false);

    if (!payload?.ok) {
      setMessage(payload?.error?.message ?? "Erro ao criar variação");
      push({ title: "Erro ao criar variação", message: payload?.error?.message, variant: "error" });
      return;
    }

    setMessage("Variação criada com sucesso");
    push({ title: "Variação criada", variant: "success" });
    setForm(emptyForm);
    loadVariants();
  };

  const openEdit = (variant: VariantRow) => {
    setEditing(variant);
    setEditForm({
      productId: variant.product.id,
      sku: variant.sku,
      stock: String(variant.stock),
      minStock: String(variant.minStock),
      attributes: variant.attributes.length ? variant.attributes : [{ name: "", value: "" }],
    });
  };

  const submitEdit = async (confirmSku = false) => {
    if (!editing) {
      return;
    }

    const skuChanged = editForm.sku.trim() !== editing.sku;
    if (skuChanged && !confirmSku) {
      setConfirmSkuChange(true);
      return;
    }

    const response = await fetch(`/api/variants/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: editForm.sku.trim(),
        stock: Number(editForm.stock),
        minStock: Number(editForm.minStock),
        attributes: editForm.attributes.filter((item) => item.name && item.value),
        confirmSkuChange: skuChanged ? true : undefined,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!payload?.ok) {
      setMessage(payload?.error?.message ?? "Erro ao atualizar");
      push({ title: "Erro ao atualizar", message: payload?.error?.message, variant: "error" });
      return;
    }

    push({ title: "Variação atualizada", variant: "success" });
    setEditing(null);
    setConfirmSkuChange(false);
    loadVariants();
  };

  const handleDelete = (variant: VariantRow) => {
    setConfirmDelete(variant);
  };

  const confirmDeleteVariant = async () => {
    if (!confirmDelete) {
      return;
    }
    const response = await fetch(`/api/variants/${confirmDelete.id}`, { method: "DELETE" });
    const payload = await response.json().catch(() => null);
    if (!payload?.ok) {
      push({ title: "Erro ao excluir", message: payload?.error?.message, variant: "error" });
      setConfirmDelete(null);
      return;
    }
    push({ title: "Variação excluída", variant: "success" });
    setConfirmDelete(null);
    loadVariants();
  };

  return (
    <DashboardShell title="Variações" subtitle="Gerencie SKUs e atributos de produtos">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground">SKUs cadastrados</h3>
          <div className="mt-4 space-y-3">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 rounded-xl border border-border bg-secondary/20"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{variant.product.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {variant.sku}</p>
                  <p className="text-xs text-muted-foreground">
                    {variant.attributes.length
                      ? variant.attributes.map((attr) => `${attr.name}: ${attr.value}`).join(" · ")
                      : "Sem atributos"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{variant.stock} un</p>
                    <p className="text-xs text-muted-foreground">Mín: {variant.minStock}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-foreground hover:bg-muted transition-colors"
                      onClick={() => openEdit(variant)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-1.5 rounded-lg border border-destructive/40 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => handleDelete(variant)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {variants.length === 0 && (
              <div className="text-sm text-muted-foreground">Nenhuma variação cadastrada ainda.</div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-card rounded-2xl border border-border p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-foreground">Criar variação</h3>
          <p className="text-sm text-muted-foreground mt-1">Selecione o produto e atributos</p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <select
              className="w-full h-10 rounded-xl border border-border bg-background px-3"
              value={form.productId}
              onChange={(event) => setForm((prev) => ({ ...prev, productId: event.target.value }))}
              required
            >
              <option value="">Selecione o produto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <div className="space-y-2">
              {attributeRows.map((attr, index) => (
                <div key={`attr-${index}`} className="grid grid-cols-2 gap-2">
                  <input
                    className="w-full h-10 rounded-xl border border-border bg-background px-3"
                    placeholder="Atributo"
                    value={attr.name}
                    onChange={(event) => handleAttributeChange(index, "name", event.target.value)}
                  />
                  <input
                    className="w-full h-10 rounded-xl border border-border bg-background px-3"
                    placeholder="Valor"
                    value={attr.value}
                    onChange={(event) => handleAttributeChange(index, "value", event.target.value)}
                  />
                </div>
              ))}
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={handleAddAttribute}
              >
                + Adicionar atributo
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                className="col-span-2 w-full h-10 rounded-xl border border-border bg-background px-3"
                placeholder="SKU (opcional)"
                value={form.sku}
                onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
              />
              <button
                type="button"
                className="h-10 rounded-xl border border-border text-xs text-foreground hover:bg-muted transition-colors"
                onClick={handleSuggestSku}
              >
                Sugerir
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                className="w-full h-10 rounded-xl border border-border bg-background px-3"
                placeholder="Estoque"
                value={form.stock}
                onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                required
              />
              <input
                className="w-full h-10 rounded-xl border border-border bg-background px-3"
                placeholder="Estoque mínimo"
                value={form.minStock}
                onChange={(event) => setForm((prev) => ({ ...prev, minStock: event.target.value }))}
                required
              />
            </div>

            {message && <p className="text-sm text-muted-foreground">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar variação"}
            </button>
          </form>
        </motion.div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Editar SKU</h3>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setEditing(null)}
              >
                Fechar
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Produto: {editing.product.name}</div>
              <input
                className="w-full h-10 rounded-xl border border-border bg-background px-3"
                placeholder="SKU"
                value={editForm.sku}
                onChange={(event) => setEditForm((prev) => ({ ...prev, sku: event.target.value }))}
              />

              <div className="space-y-2">
                {editAttributeRows.map((attr, index) => (
                  <div key={`edit-attr-${index}`} className="grid grid-cols-2 gap-2">
                    <input
                      className="w-full h-10 rounded-xl border border-border bg-background px-3"
                      placeholder="Atributo"
                      value={attr.name}
                      onChange={(event) => handleEditAttributeChange(index, "name", event.target.value)}
                    />
                    <input
                      className="w-full h-10 rounded-xl border border-border bg-background px-3"
                      placeholder="Valor"
                      value={attr.value}
                      onChange={(event) => handleEditAttributeChange(index, "value", event.target.value)}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={handleAddEditAttribute}
                >
                  + Adicionar atributo
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full h-10 rounded-xl border border-border bg-background px-3"
                  placeholder="Estoque"
                  value={editForm.stock}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, stock: event.target.value }))}
                />
                <input
                  className="w-full h-10 rounded-xl border border-border bg-background px-3"
                  placeholder="Estoque mínimo"
                  value={editForm.minStock}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, minStock: event.target.value }))}
                />
              </div>

              <button
                type="button"
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                onClick={() => submitEdit()}
              >
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmSkuChange}
        title="Alterar SKU"
        description="O SKU é imutável por padrão. Deseja confirmar a alteração?"
        confirmLabel="Confirmar alteração"
        onCancel={() => setConfirmSkuChange(false)}
        onConfirm={() => submitEdit(true)}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Excluir variação"
        description="Isso removerá o SKU e suas movimentações vinculadas."
        confirmLabel="Excluir variação"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteVariant}
      />
    </DashboardShell>
  );
}
