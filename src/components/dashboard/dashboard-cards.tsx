"use client";

import { Package, ArrowUpRight, ArrowDownRight, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

interface DashboardCardsProps {
  totalStock: number;
  lowStock: number;
  entradasMes: number;
  saidasMes: number;
  entradasChange: number;
  saidasChange: number;
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  iconColor: string;
}

function StatCard({ title, value, change, trend, icon: Icon, iconColor }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`h-12 w-12 rounded-xl ${iconColor} flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            trend === "up"
              ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400"
              : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
          }`}
        >
          {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span className="text-xs font-medium">{change}</span>
        </div>
      </div>
      <p className="text-muted-foreground text-sm mb-1">{title}</p>
      <p className="text-3xl font-semibold text-foreground">{value}</p>
    </motion.div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function DashboardCards({
  totalStock,
  lowStock,
  entradasMes,
  saidasMes,
  entradasChange,
  saidasChange,
}: DashboardCardsProps) {
  const stats = [
    {
      title: "Total em Estoque",
      value: formatNumber(totalStock),
      change: `+${entradasChange}%`,
      trend: entradasChange >= 0 ? ("up" as const) : ("down" as const),
      icon: Package,
      iconColor: "bg-primary",
    },
    {
      title: "Estoque Baixo",
      value: formatNumber(lowStock),
      change: `${lowStock === 0 ? "0" : "-" + lowStock}%`,
      trend: lowStock === 0 ? ("up" as const) : ("down" as const),
      icon: AlertTriangle,
      iconColor: "bg-warning",
    },
    {
      title: "Entradas (mês)",
      value: formatNumber(entradasMes),
      change: `${entradasChange}%`,
      trend: entradasChange >= 0 ? ("up" as const) : ("down" as const),
      icon: ArrowUpRight,
      iconColor: "bg-success",
    },
    {
      title: "Saídas (mês)",
      value: formatNumber(saidasMes),
      change: `${saidasChange}%`,
      trend: saidasChange >= 0 ? ("up" as const) : ("down" as const),
      icon: ArrowDownRight,
      iconColor: "bg-chart-5",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
