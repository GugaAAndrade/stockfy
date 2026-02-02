"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { motion } from "motion/react";

interface DashboardShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function DashboardShell({ title, subtitle, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Sidebar />
      <MobileNav />

      <div className="md:ml-20">
        <Header />

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 md:p-8 space-y-6 md:space-y-8"
        >
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </motion.main>
      </div>
    </div>
  );
}
