import { Search, Bell, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { ThemeToggle } from "@/app/components/theme-toggle";

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 h-16 bg-card border-b border-border backdrop-blur-sm bg-card/80"
    >
      <div className="h-full flex items-center justify-between px-4 md:px-8">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produtos, fornecedores..."
              className="w-full h-11 pl-10 pr-4 bg-secondary rounded-xl border border-transparent focus:border-primary focus:bg-background transition-all outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {/* Mobile Logo/Title */}
          <div className="sm:hidden">
            <h2 className="text-lg font-semibold text-foreground">StockPro</h2>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Search Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="sm:hidden h-10 w-10 rounded-xl bg-secondary hover:bg-muted transition-colors flex items-center justify-center"
          >
            <Search className="h-5 w-5 text-foreground" />
          </motion.button>

          <ThemeToggle />

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative h-10 w-10 rounded-xl bg-secondary hover:bg-muted transition-colors flex items-center justify-center"
          >
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          </motion.button>

          {/* User Profile */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden sm:flex items-center gap-3 h-11 pl-2 pr-3 rounded-xl bg-secondary hover:bg-muted transition-colors"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="font-medium text-primary-foreground">AD</span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-foreground">Admin</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
          </motion.button>

          {/* Mobile User Avatar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="sm:hidden h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
          >
            <span className="text-sm font-medium text-primary-foreground">AD</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}