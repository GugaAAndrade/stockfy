"use client";

import Link from "next/link";
import { Plus, ArrowUpRight, ArrowDownRight, FileText, Download, Upload } from "lucide-react";
import { motion } from "motion/react";

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  delay: number;
  href: string;
}

function QuickActionCard({ icon: Icon, label, description, color, delay, href }: QuickActionProps) {
  return (
    <Link href={href} className="block">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="group relative bg-card rounded-xl border border-border p-4 text-left hover:shadow-lg transition-all overflow-hidden"
      >
        <div className={`absolute inset-0 ${color} opacity-0 group-hover:opacity-5 transition-opacity`} />
        <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center mb-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h4 className="font-semibold text-foreground mb-1">{label}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </motion.div>
    </Link>
  );
}

export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: "Adicionar Produto",
      description: "Cadastrar novo item no estoque",
      color: "bg-primary",
      delay: 0.1,
      href: "/produtos?new=1",
    },
    {
      icon: ArrowUpRight,
      label: "Entrada de Estoque",
      description: "Registrar recebimento de produtos",
      color: "bg-success",
      delay: 0.15,
      href: "/movimentacoes?type=in",
    },
    {
      icon: ArrowDownRight,
      label: "Saída de Estoque",
      description: "Registrar venda ou retirada",
      color: "bg-warning",
      delay: 0.2,
      href: "/movimentacoes?type=out",
    },
    {
      icon: FileText,
      label: "Gerar Relatório",
      description: "Criar relatório personalizado",
      color: "bg-chart-4",
      delay: 0.25,
      href: "/relatorios",
    },
    {
      icon: Download,
      label: "Exportar Dados",
      description: "Baixar planilha do estoque",
      color: "bg-chart-2",
      delay: 0.3,
      href: "/produtos?export=1",
    },
    {
      icon: Upload,
      label: "Importar Produtos",
      description: "Carregar lista de produtos",
      color: "bg-chart-5",
      delay: 0.35,
      href: "/produtos?import=1",
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Ações Rápidas</h3>
        <p className="text-sm text-muted-foreground mt-1">Acesso rápido às principais funcionalidades</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {actions.map((action) => (
          <QuickActionCard key={action.label} {...action} />
        ))}
      </div>
    </div>
  );
}
