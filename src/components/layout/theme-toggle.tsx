"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "@/components/layout/theme-provider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-10 rounded-xl bg-secondary" aria-hidden="true" />;
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-xl bg-secondary hover:bg-muted transition-colors flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Alternar tema"
      type="button"
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === "light" ? 1 : 0,
          opacity: theme === "light" ? 1 : 0,
          rotate: theme === "light" ? 0 : 180,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Sun className="h-5 w-5 text-foreground" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === "dark" ? 1 : 0,
          opacity: theme === "dark" ? 1 : 0,
          rotate: theme === "dark" ? 0 : -180,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Moon className="h-5 w-5 text-foreground" />
      </motion.div>
    </motion.button>
  );
}
