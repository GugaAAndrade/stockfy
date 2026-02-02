import { Sidebar } from "@/app/components/sidebar";
import { Header } from "@/app/components/header";
import { DashboardCards } from "@/app/components/dashboard-cards";
import { ProductTable } from "@/app/components/product-table";
import { StatsChart } from "@/app/components/stats-chart";
import { QuickActions } from "@/app/components/quick-actions";
import { RecentActivity } from "@/app/components/recent-activity";
import { MobileNav } from "@/app/components/mobile-nav";
import { LiveMetrics } from "@/app/components/live-metrics";
import { motion } from "motion/react";

export default function App() {
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
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral do seu estoque e movimentações
            </p>
          </div>

          {/* Stats Cards */}
          <DashboardCards />

          {/* Live Metrics */}
          <LiveMetrics />

          {/* Quick Actions */}
          <QuickActions />

          {/* Charts */}
          <StatsChart />

          {/* Recent Activity and Product Table in Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProductTable />
            </div>
            <div className="lg:col-span-1">
              <RecentActivity />
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}