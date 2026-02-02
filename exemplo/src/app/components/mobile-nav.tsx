import { LayoutDashboard, Package, TrendingUp, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Package, label: "Produtos" },
  { icon: TrendingUp, label: "Movimentações" },
  { icon: Settings, label: "Configurações" },
];

export function MobileNav() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border backdrop-blur-sm bg-card/95 pb-safe"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === activeIndex;

          return (
            <motion.button
              key={index}
              onClick={() => setActiveIndex(index)}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
              whileTap={{ scale: 0.9 }}
            >
              <div
                className={`flex flex-col items-center justify-center transition-all duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-6 w-6 mb-1 ${isActive ? "scale-110" : ""}`} />
                <span className={`text-xs font-medium ${isActive ? "opacity-100" : "opacity-70"}`}>
                  {item.label}
                </span>
              </div>

              {isActive && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
