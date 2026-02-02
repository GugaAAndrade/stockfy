"use client";

/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProductTable, ProductRow } from "@/components/dashboard/product-table";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type ProductApiRow = {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  stock: number;
  minStock: number;
  unitPrice: string | number;
  updatedAt: string;
};

type ProductDetails = ProductApiRow & {
  sku: string;
  variants: Array<{
    id: string;
    sku: string;
    stock: number;
    minStock: number;
    isDefault: boolean;
    attributes: Array<{ name: string; value: string }>;
  }>;
};

const emptyForm = {
  name: "",
  categoryId: "",
  unitPrice: "",
  stock: "",
  minStock: "",
  description: "",
};

const emptyCategory = { name: "" };

export default function ProductsPage() {
  const params = useParams();
  const companySlug = typeof params.companySlug === "string" ? params.companySlug : "";
  const basePath = companySlug ? `/app/${companySlug}` : "/app";
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const shouldOpenNew = searchParams.get("new") === "1";
  const shouldOpenImport = searchParams.get("import") === "1";

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [categoryEditing, setCategoryEditing] = useState<{ id: string; name: string } | null>(null);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [editingDetails, setEditingDetails] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categoryMessage, setCategoryMessage] = useState("");
  const [confirmProduct, setConfirmProduct] = useState<ProductRow | null>(null);
  const [confirmCategoryId, setConfirmCategoryId] = useState<string | null>(null);
  const { push } = useToast();
  const createFormRef = useRef<HTMLDivElement | null>(null);

  const loadProducts = async () => {
    const response = await fetch(`/api/products${search ? `?search=${encodeURIComponent(search)}` : ""}`);
    const payload = await response.json().catch(() => null);
    if (payload?.ok) {
      const mapped = (payload.data as ProductApiRow[]).map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        categoryId: product.categoryId,
        stock: product.stock,
        minStock: product.minStock,
        unitPrice: Number(product.unitPrice),
        updatedAt: product.updatedAt,
      }));
      setProducts(mapped);
    }
  };

  const loadCategories = async () => {
    const response = await fetch("/api/categories");
    const payload = await response.json().catch(() => null);
    if (payload?.ok) {
      setCategories(payload.data);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [search]);

  const handleCreateChange =
    (field: keyof typeof emptyForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setCreateForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleEditChange =
    (field: keyof typeof emptyForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setEditForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    mode: "create" | "edit"
  ) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const sourceForm = mode === "edit" ? editForm : createForm;
    const payloadData = {
      name: sourceForm.name,
      categoryId: sourceForm.categoryId,
      unitPrice: Number(sourceForm.unitPrice),
      stock: Number(sourceForm.stock),
      minStock: Number(sourceForm.minStock),
      description: sourceForm.description || undefined,
    };

    const response = await fetch(mode === "edit" && editing ? `/api/products/${editing.id}` : "/api/products", {
      method: mode === "edit" ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadData),
    });

    const payload = await response.json().catch(() => null);
    setLoading(false);

    if (!payload?.ok) {
      setMessage(payload?.error?.message ?? "Erro ao salvar");
      push({ title: "Erro ao salvar", message: payload?.error?.message, variant: "error" });
      return;
    }

    setMessage(mode === "edit" ? "Produto atualizado" : "Produto cadastrado com sucesso");
    push({
      title: mode === "edit" ? "Produto atualizado" : "Produto cadastrado",
      variant: "success",
    });
    setCreateForm(emptyForm);
    setEditForm(emptyForm);
    setEditing(null);
    loadProducts();
  };

  const handleExport = () => {
    window.location.href = "/api/products/export";
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    const response = await fetch("/api/products/import", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: text,
    });
    const payload = await response.json().catch(() => null);
    if (payload?.ok) {
      setMessage(`Importados ${payload.data.count} produtos`);
      loadProducts();
      push({
        title: "Importação concluída",
        message: `Importados ${payload.data.count} produtos`,
        variant: "success",
      });
    } else {
      setMessage(payload?.error?.message ?? "Erro ao importar");
      push({ title: "Erro na importação", message: payload?.error?.message, variant: "error" });
    }
  };

  const handleCategorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCategoryMessage("");

    const response = await fetch(
      categoryEditing ? `/api/categories/${categoryEditing.id}` : "/api/categories",
      {
        method: categoryEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryForm.name }),
      }
    );
    const payload = await response.json().catch(() => null);
    if (!payload?.ok) {
      setCategoryMessage(payload?.error?.message ?? "Erro ao criar categoria");
      push({ title: "Erro na categoria", message: payload?.error?.message, variant: "error" });
      return;
    }

    setCategoryMessage(categoryEditing ? "Categoria atualizada" : "Categoria criada");
    push({
      title: categoryEditing ? "Categoria atualizada" : "Categoria criada",
      variant: "success",
    });
    setCategoryForm(emptyCategory);
    setCategoryEditing(null);
    loadCategories();
  };

  const handleCategoryDelete = (categoryId: string) => {
    setConfirmCategoryId(categoryId);
  };

  const handleCategoryDeleteConfirm = async () => {
    if (!confirmCategoryId) {
      return;
    }
    const response = await fetch(`/api/categories/${confirmCategoryId}`, { method: "DELETE" });
    const payload = await response.json().catch(() => null);
    if (!payload?.ok) {
      setCategoryMessage(payload?.error?.message ?? "Erro ao excluir categoria");
      push({
        title: "Erro ao excluir categoria",
        message: payload?.error?.message,
        variant: "error",
      });
      setConfirmCategoryId(null);
      return;
    }
    setCategoryMessage("Categoria excluída");
    push({ title: "Categoria excluída", variant: "success" });
    setConfirmCategoryId(null);
    loadCategories();
  };

  const openEdit = async (product: ProductRow) => {
    setEditing(product);
    setEditForm({
      name: product.name,
      categoryId: product.categoryId ?? "",
      unitPrice: String(product.unitPrice),
      stock: String(product.stock),
      minStock: String(product.minStock),
      description: "",
    });
    const response = await fetch(`/api/products/${product.id}`);
    const payload = await response.json().catch(() => null);
    if (payload?.ok) {
      setEditingDetails(payload.data as ProductDetails);
    }
  };

  const handleDelete = (product: ProductRow) => {
    setConfirmProduct(product);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmProduct) {
      return;
    }
    const response = await fetch(`/api/products/${confirmProduct.id}`, { method: "DELETE" });
    const payload = await response.json().catch(() => null);
    if (!payload?.ok) {
      setMessage(payload?.error?.message ?? "Erro ao excluir");
      push({ title: "Erro ao excluir", message: payload?.error?.message, variant: "error" });
      setConfirmProduct(null);
      return;
    }
    setMessage("Produto excluído");
    push({ title: "Produto excluído", variant: "success" });
    setConfirmProduct(null);
    loadProducts();
  };

  return (
    <DashboardShell title="Produtos" subtitle="Cadastre e gerencie os itens do estoque">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProductTable
            products={products}
            onEditProduct={openEdit}
            onDeleteProduct={handleDelete}
            onAddProduct={() => createFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6 shadow-sm"
            ref={createFormRef}
          >
            <h3 className="text-lg font-semibold text-foreground">Cadastrar Produto</h3>
            <p className="text-sm text-muted-foreground mt-1">Preencha os dados do novo item</p>

            <form onSubmit={(event) => handleSubmit(event, "create")} className="mt-4 space-y-3">
              <input
                className="w-full h-10 rounded-xl border border-border bg-background px-3"
                placeholder="Nome"
                value={createForm.name}
                onChange={handleCreateChange("name")}
                required
              />
              <select
                className="w-full h-10 rounded-xl border border-border bg-background px-3"
                value={createForm.categoryId}
                onChange={handleCreateChange("categoryId")}
                required
              >
                <option value="">Selecione a categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="w-full h-10 rounded-xl border border-border bg-background px-3"
                  placeholder="Preço"
                  value={createForm.unitPrice}
                  onChange={handleCreateChange("unitPrice")}
                  required
                />
                <input
                  className="w-full h-10 rounded-xl border border-border bg-background px-3"
                  placeholder="Estoque"
                  value={createForm.stock}
                  onChange={handleCreateChange("stock")}
                  required
                />
              </div>
              <input
                className="w-full h-10 rounded-xl border border-border bg-background px-3"
                placeholder="Estoque mínimo"
                value={createForm.minStock}
                onChange={handleCreateChange("minStock")}
                required
              />
              <textarea
                className="w-full h-20 rounded-xl border border-border bg-background px-3 py-2"
                placeholder="Descrição (opcional)"
                value={createForm.description}
                onChange={handleCreateChange("description")}
              />
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {loading ? "Salvando..." : "Salvar Produto"}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-foreground">Categorias</h3>
            <p className="text-sm text-muted-foreground mt-1">Crie e organize categorias de produtos</p>
            <form onSubmit={handleCategorySubmit} className="mt-4 space-y-3">
              <input
                className="w-full h-10 rounded-xl border border-border bg-background px-3"
                placeholder="Nome da categoria"
                value={categoryForm.name}
                onChange={(event) => setCategoryForm({ name: event.target.value })}
                required
              />
              {categoryMessage && <p className="text-sm text-muted-foreground">{categoryMessage}</p>}
              <button
                type="submit"
                className="w-full h-10 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
              >
                {categoryEditing ? "Atualizar categoria" : "Adicionar categoria"}
              </button>
            </form>
            <div className="mt-4 space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between text-sm text-foreground">
                  <span>{category.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-xs text-foreground hover:text-primary"
                      onClick={() => {
                        setCategoryEditing({ id: category.id, name: category.name });
                        setCategoryForm({ name: category.name });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="text-xs text-destructive hover:underline"
                      onClick={() => handleCategoryDelete(category.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-foreground">Importar / Exportar</h3>
            <p className="text-sm text-muted-foreground mt-1">CSV padrão do estoque</p>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={handleExport}
                className="w-full h-10 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
              >
                Exportar CSV
              </button>
              <label className="block w-full h-10 rounded-xl bg-secondary hover:bg-muted transition-colors text-center leading-10 cursor-pointer">
                Importar CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
              </label>
              {(shouldOpenNew || shouldOpenImport) && (
                <p className="text-xs text-muted-foreground">Ação rápida selecionada.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl bg-card rounded-2xl border border-border p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Editar Produto</h3>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setEditing(null);
                  setEditingDetails(null);
                }}
              >
                Fechar
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form onSubmit={(event) => handleSubmit(event, "edit")} className="space-y-3">
                <input
                  className="w-full h-10 rounded-xl border border-border bg-background px-3"
                  placeholder="Nome"
                  value={editForm.name}
                  onChange={handleEditChange("name")}
                  required
                />
                <select
                  className="w-full h-10 rounded-xl border border-border bg-background px-3"
                  value={editForm.categoryId}
                  onChange={handleEditChange("categoryId")}
                  required
                >
                  <option value="">Selecione a categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="w-full h-10 rounded-xl border border-border bg-background px-3"
                    placeholder="Preço"
                    value={editForm.unitPrice}
                    onChange={handleEditChange("unitPrice")}
                    required
                  />
                  <input
                    className="w-full h-10 rounded-xl border border-border bg-background px-3"
                    placeholder="Estoque"
                    value={editForm.stock}
                    onChange={handleEditChange("stock")}
                    required
                  />
                </div>
                <input
                  className="w-full h-10 rounded-xl border border-border bg-background px-3"
                  placeholder="Estoque mínimo"
                  value={editForm.minStock}
                  onChange={handleEditChange("minStock")}
                  required
                />
                <textarea
                  className="w-full h-20 rounded-xl border border-border bg-background px-3 py-2"
                  placeholder="Descrição (opcional)"
                  value={editForm.description}
                  onChange={handleEditChange("description")}
                />
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Atualizar Produto
                </button>
              </form>

              <div className="bg-secondary/20 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Variações (SKUs)</h4>
                  <a
                    href={`${basePath}/variacoes?productId=${editing.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Gerenciar SKUs
                  </a>
                </div>
                <div className="mt-3 space-y-2">
                  {(editingDetails?.variants ?? []).map((variant) => (
                    <div key={variant.id} className="rounded-lg border border-border bg-background px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-foreground">
                            {variant.isDefault ? "SKU padrão" : "SKU"}
                          </p>
                          <p className="text-xs text-muted-foreground">{variant.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-foreground">{variant.stock} un</p>
                          <p className="text-[11px] text-muted-foreground">Mín: {variant.minStock}</p>
                        </div>
                      </div>
                      {variant.attributes?.length > 0 && (
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {variant.attributes.map((attr) => `${attr.name}: ${attr.value}`).join(" · ")}
                        </p>
                      )}
                    </div>
                  ))}
                  {!editingDetails?.variants?.length && (
                    <p className="text-xs text-muted-foreground">Nenhuma variação cadastrada.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmProduct)}
        title="Excluir produto"
        description="Isso excluirá o produto e todas as movimentações vinculadas. Deseja continuar?"
        confirmLabel="Excluir mesmo assim"
        onCancel={() => setConfirmProduct(null)}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDialog
        open={Boolean(confirmCategoryId)}
        title="Excluir categoria"
        description="Se houver produtos vinculados, a exclusão será bloqueada."
        confirmLabel="Excluir categoria"
        onCancel={() => setConfirmCategoryId(null)}
        onConfirm={handleCategoryDeleteConfirm}
      />
    </DashboardShell>
  );
}
