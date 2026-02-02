"use client";

import { MoreVertical, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

export interface ProductRow {
  id: string;
  name: string;
  sku: string;
  category: string;
  categoryId?: string;
  stock: number;
  minStock: number;
  unitPrice: number;
  updatedAt: string;
}

interface ProductTableProps {
  products: ProductRow[];
  onAddProduct?: () => void;
  onEditProduct?: (product: ProductRow) => void;
  onDeleteProduct?: (product: ProductRow) => void;
}

function getStatusBadge(stock: number, minStock: number) {
  const status = stock === 0 ? "critical" : stock <= minStock ? "low" : "normal";
  const styles = {
    normal:
      "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900",
    low:
      "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900",
    critical:
      "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900",
  };

  const labels = {
    normal: "Normal",
    low: "Estoque Baixo",
    critical: "Crítico",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${
        styles[status]
      }`}
    >
      {status !== "normal" && <AlertCircle className="h-3 w-3" />}
      {labels[status]}
    </span>
  );
}

function formatRelative(dateString: string) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) {
    return `${minutes} min atrás`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} horas atrás`;
  }
  const days = Math.floor(hours / 24);
  return `${days} dias atrás`;
}

export function ProductTable({ products, onAddProduct, onEditProduct, onDeleteProduct }: ProductTableProps) {
  const hasProducts = products.length > 0;
  const hasActions = Boolean(onEditProduct || onDeleteProduct);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const [page, setPage] = useState(1);
  const currentPage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, currentPage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Produtos em Estoque</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie e monitore seu inventário</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
          type="button"
          onClick={onAddProduct}
        >
          + Adicionar Produto
        </motion.button>
      </div>

      {hasProducts ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Última Atualização
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-secondary/30 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {product.sku ? product.sku.slice(-2) : "--"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{product.stock} un</span>
                          <span className="text-xs text-muted-foreground">Mín: {product.minStock}</span>
                        </div>
                        {product.stock > product.minStock ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-foreground">
                        R$ {product.unitPrice.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(product.stock, product.minStock)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">{formatRelative(product.updatedAt)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {hasActions ? (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEditProduct && (
                            <button
                              type="button"
                              onClick={() => onEditProduct(product)}
                              className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-foreground hover:bg-muted transition-colors"
                            >
                              Editar
                            </button>
                          )}
                          {onDeleteProduct && (
                            <button
                              type="button"
                              onClick={() => onDeleteProduct(product)}
                              className="px-2.5 py-1.5 rounded-lg border border-destructive/40 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="h-8 w-8 rounded-lg hover:bg-muted transition-colors inline-flex items-center justify-center"
                            type="button"
                            aria-label="Mais ações"
                          >
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </motion.button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border bg-secondary/20 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{pageItems.length}</span> de{" "}
              <span className="font-medium text-foreground">{products.length}</span> produtos
            </p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, idx) => {
                const pageNumber = idx + 1;
                const isActive = pageNumber === currentPage;
                return (
                  <button
                    key={`page-${pageNumber}`}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-foreground hover:bg-muted"
                    }`}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Próximo
              </button>
            </div>
          </div>
          )}
        </>
      ) : (
        <div className="px-6 py-10 text-center text-sm text-muted-foreground">
          Nenhum produto cadastrado ainda.
        </div>
      )}
    </motion.div>
  );
}
