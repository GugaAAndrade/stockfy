"use client";

import { Clock, Package, TrendingUp, TrendingDown, User } from "lucide-react";
import { motion } from "motion/react";

export interface ActivityItem {
  id: string;
  type: "entrada" | "saida" | "cadastro" | "atualizacao";
  description: string;
  user: string;
  time: string;
  product?: string;
  quantity?: number;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

function getActivityIcon(type: ActivityItem["type"]) {
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

function formatActivityTime(value: string) {
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleString("pt-BR");
  }
  return value;
}

export function RecentActivity({ activities }: RecentActivityProps) {
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
                    {formatActivityTime(activity.time)}
                  </span>
                </div>
                {activity.product && (
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.product}
                    {activity.quantity && (
                      <span className="ml-2 text-foreground font-medium">({activity.quantity} un)</span>
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
        type="button"
      >
        Ver todas as atividades
      </motion.button>
    </motion.div>
  );
}
