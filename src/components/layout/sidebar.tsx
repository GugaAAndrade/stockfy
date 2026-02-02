"use client";

import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Settings,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Produtos", href: "/produtos" },
  { icon: TrendingUp, label: "Movimentações", href: "/movimentacoes" },
  { icon: Package, label: "Variações", href: "/variacoes" },
  { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
  { icon: Users, label: "Fornecedores", href: "/fornecedores" },
  { icon: FileText, label: "Documentos", href: "/documentos" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-0 top-0 h-screen w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 z-50 hidden md:flex"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="mb-8 h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg"
      >
        <Package className="h-6 w-6 text-primary-foreground" />
      </motion.div>

      <nav className="flex-1 flex flex-col gap-2 w-full px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.label} href={item.href} className="relative group">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <div
                  className={`
                    h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                  <div className="bg-card text-card-foreground px-3 py-2 rounded-lg shadow-lg border border-border whitespace-nowrap text-sm">
                    {item.label}
                  </div>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
