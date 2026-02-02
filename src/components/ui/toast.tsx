"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: string;
  title: string;
  message?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  push: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toastColors(variant: ToastVariant) {
  if (variant === "success") return "border-success/40 bg-success/10 text-success";
  if (variant === "error") return "border-destructive/40 bg-destructive/10 text-destructive";
  return "border-primary/30 bg-primary/10 text-primary";
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = (toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  };

  const value = useMemo(() => ({ push }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-6 top-6 z-[60] space-y-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`min-w-[260px] max-w-sm rounded-xl border px-4 py-3 shadow-lg ${toastColors(toast.variant ?? "info")}`}
            >
              <p className="text-sm font-semibold text-foreground">{toast.title}</p>
              {toast.message && <p className="text-xs text-muted-foreground mt-1">{toast.message}</p>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
