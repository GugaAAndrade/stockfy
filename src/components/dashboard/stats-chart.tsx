"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "motion/react";

export interface LineDatum {
  name: string;
  entradas: number;
  saidas: number;
}

export interface BarDatum {
  name: string;
  value: number;
}

interface StatsChartProps {
  lineData: LineDatum[];
  barData: BarDatum[];
}

export function StatsChart({ lineData, barData }: StatsChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-border p-6 shadow-sm"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Movimentações Mensais</h3>
          <p className="text-sm text-muted-foreground mt-1">Entradas e saídas nos últimos 6 meses</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
            <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                color: "var(--foreground)",
              }}
            />
            <Line
              type="monotone"
              dataKey="entradas"
              stroke="var(--success)"
              strokeWidth={3}
              dot={{ fill: "var(--success)", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="saidas"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={{ fill: "var(--primary)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Entradas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Saídas</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl border border-border p-6 shadow-sm"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Produtos por Categoria</h3>
          <p className="text-sm text-muted-foreground mt-1">Distribuição do estoque atual</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="name"
              stroke="var(--muted-foreground)"
              style={{ fontSize: "12px" }}
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                color: "var(--foreground)",
              }}
              wrapperStyle={{ backgroundColor: "var(--card)" }}
              cursor={{ fill: "transparent" }}
            />
            <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
