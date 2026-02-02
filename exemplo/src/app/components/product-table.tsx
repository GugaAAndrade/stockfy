import { MoreVertical, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  status: "normal" | "low" | "critical";
  lastUpdate: string;
}

const mockProducts: Product[] = [
  { id: "PRD001", name: "Notebook Dell Inspiron 15", category: "Eletrônicos", stock: 45, minStock: 10, price: 3499.00, status: "normal", lastUpdate: "2 horas atrás" },
  { id: "PRD002", name: "Mouse Logitech MX Master", category: "Periféricos", stock: 8, minStock: 15, price: 349.90, status: "low", lastUpdate: "5 horas atrás" },
  { id: "PRD003", name: "Teclado Mecânico RGB", category: "Periféricos", stock: 120, minStock: 20, price: 459.00, status: "normal", lastUpdate: "1 dia atrás" },
  { id: "PRD004", name: "Monitor LG 27\" 4K", category: "Eletrônicos", stock: 3, minStock: 5, price: 1899.00, status: "critical", lastUpdate: "3 horas atrás" },
  { id: "PRD005", name: "Webcam Logitech C920", category: "Periféricos", stock: 67, minStock: 15, price: 549.00, status: "normal", lastUpdate: "6 horas atrás" },
  { id: "PRD006", name: "Headset HyperX Cloud II", category: "Áudio", stock: 12, minStock: 20, price: 599.00, status: "low", lastUpdate: "4 horas atrás" },
  { id: "PRD007", name: "SSD Kingston 1TB", category: "Armazenamento", stock: 89, minStock: 25, price: 449.00, status: "normal", lastUpdate: "1 hora atrás" },
  { id: "PRD008", name: "Memória RAM 16GB DDR4", category: "Hardware", stock: 156, minStock: 30, price: 289.00, status: "normal", lastUpdate: "8 horas atrás" },
];

function getStatusBadge(status: Product["status"]) {
  const styles = {
    normal: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900",
    low: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900",
    critical: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900",
  };

  const labels = {
    normal: "Normal",
    low: "Estoque Baixo",
    critical: "Crítico",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${styles[status]}`}>
      {status !== "normal" && <AlertCircle className="h-3 w-3" />}
      {labels[status]}
    </span>
  );
}

export function ProductTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Produtos em Estoque</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie e monitore seu inventário</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          + Adicionar Produto
        </motion.button>
      </div>

      {/* Table */}
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
            {mockProducts.map((product, index) => (
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
                      <span className="text-xs font-semibold text-primary">{product.id.slice(-2)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.id}</p>
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
                    R$ {product.price.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(product.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground">{product.lastUpdate}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="h-8 w-8 rounded-lg hover:bg-muted transition-colors inline-flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border bg-secondary/20 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium text-foreground">8</span> de <span className="font-medium text-foreground">248</span> produtos
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Anterior
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            1
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">
            2
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">
            3
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">
            Próximo
          </button>
        </div>
      </div>
    </motion.div>
  );
}
