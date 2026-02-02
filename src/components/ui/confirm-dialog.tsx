"use client";

import { motion } from "motion/react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
