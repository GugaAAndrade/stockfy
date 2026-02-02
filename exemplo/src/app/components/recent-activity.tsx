import { Clock, Package, TrendingUp, TrendingDown, User } from "lucide-react";
import { motion } from "motion/react";

interface Activity {
  id: string;
  type: "entrada" | "saida" | "cadastro" | "atualizacao";
  description: string;
  user: string;
  time: string;
  product?: string;
  quantity?: number;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "entrada",
    description: "Entrada de estoque",
    user: "João Silva",
    time: "10 min atrás",
    product: "Notebook Dell Inspiron 15",
    quantity: 15,
  },
  {
    id: "2",
    type: "saida",
    description: "Saída de estoque",
    user: "Maria Santos",
    time: "25 min atrás",
    product: "Mouse Logitech MX Master",
    quantity: 5,
  },
  {
    id: "3",
    type: "cadastro",
    description: "Novo produto cadastrado",
    user: "Carlos Oliveira",
    time: "1 hora atrás",
    product: "Webcam 4K Pro",
  },
  {
    id: "4",
    type: "atualizacao",
    description: "Preço atualizado",
    user: "Ana Costa",
    time: "2 horas atrás",
    product: "Teclado Mecânico RGB",
  },
  {
    id: "5",
    type: "entrada",
    description: "Entrada de estoque",
    user: "Pedro Alves",
    time: "3 horas atrás",
    product: "Monitor LG 27\" 4K",
    quantity: 8,
  },
];

function getActivityIcon(type: Activity["type"]) {
  switch (type) {
    case "entrada":
      return { icon: TrendingUp, color: "bg-success" };
    case "saida":
      return { icon: TrendingDown, color: "bg-warning" };
    case "cadastro":
      return { icon: Package, color: "bg-primary" };
    case "atualizacao":
      return { icon: Clock, color: "bg-chart-4" };
  }
}

export function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Atividades Recentes</h3>
        <p className="text-sm text-muted-foreground mt-1">Últimas movimentações no sistema</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const { icon: Icon, color } = getActivityIcon(activity.type);

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors group"
            >
              <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="h-5 w-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-foreground text-sm">{activity.description}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
                {activity.product && (
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.product}
                    {activity.quantity && (
                      <span className="ml-2 text-foreground font-medium">
                        ({activity.quantity} un)
                      </span>
                    )}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{activity.user}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
      >
        Ver todas as atividades
      </motion.button>
    </motion.div>
  );
}
