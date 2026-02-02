"use client";

import { Activity, TrendingUp, Clock, DollarSign } from "lucide-react";
import { motion } from "motion/react";

interface LiveMetricsProps {
  totalValue: number;
  movementsToday: number;
  rotation: number;
  avgRestockDays: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function LiveMetrics({ totalValue, movementsToday, rotation, avgRestockDays }: LiveMetricsProps) {
  const metrics = [
    {
      label: "Valor Total em Estoque",
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: "text-primary",
    },
    {
      label: "Movimentações Hoje",
      value: String(movementsToday),
      icon: Activity,
      color: "text-success",
    },
    {
      label: "Taxa de Rotatividade",
      value: `${rotation}%`,
      icon: TrendingUp,
      color: "text-warning",
    },
    {
      label: "Tempo Médio de Reposição",
      value: `${avgRestockDays.toFixed(1)} dias`,
      icon: Clock,
      color: "text-chart-4",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={metric.color}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{metric.label}</p>
                <motion.p
                  key={metric.value}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-semibold text-foreground mt-0.5"
                >
                  {metric.value}
                </motion.p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
