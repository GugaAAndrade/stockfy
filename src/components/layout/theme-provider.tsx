"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const storageKey = "theme";

function applyTheme(nextTheme: Theme) {
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const saved = localStorage.getItem(storageKey) as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return saved ?? (prefersDark ? "dark" : "light");
  });
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) {
      return;
    }
    didInit.current = true;
    const saved = localStorage.getItem(storageKey) as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved ?? (prefersDark ? "dark" : "light");
    if (initial !== theme) {
      setTheme(initial);
    }
    applyTheme(initial);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(storageKey, theme);
    applyTheme(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      setTheme,
      toggleTheme: () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
