import { Activity, TrendingUp, Clock, DollarSign } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface Metric {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

export function LiveMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "Valor Total em Estoque", value: "R$ 2.847.540", icon: DollarSign, color: "text-primary" },
    { label: "Movimentações Hoje", value: "127", icon: Activity, color: "text-success" },
    { label: "Taxa de Rotatividade", value: "78%", icon: TrendingUp, color: "text-warning" },
    { label: "Tempo Médio de Reposição", value: "3.2 dias", icon: Clock, color: "text-chart-4" },
  ]);

  // Simular atualização em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => {
          if (metric.label === "Movimentações Hoje") {
            const current = parseInt(metric.value);
            return { ...metric, value: String(current + Math.floor(Math.random() * 3)) };
          }
          return metric;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`${metric.color}`}>
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
