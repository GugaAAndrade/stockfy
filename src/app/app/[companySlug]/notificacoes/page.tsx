"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = async () => {
    const response = await fetch("/api/notifications");
    const payload = await response.json();
    if (payload?.ok) {
      setNotifications(payload.data);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "POST" });
    loadNotifications();
  };

  return (
    <DashboardShell title="Notificações" subtitle="Acompanhe alertas e avisos do sistema">
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <button
          type="button"
          onClick={markAllRead}
          className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
        >
          Marcar todas como lidas
        </button>

        {notifications.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma notificação disponível.</p>
        )}

        {notifications.map((notice) => (
          <div
            key={notice.id}
            className={`p-4 rounded-xl border ${notice.readAt ? "border-border" : "border-primary/40 bg-primary/5"}`}
          >
            <p className="font-medium text-foreground">{notice.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{notice.message}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(notice.createdAt).toLocaleString("pt-BR")}
            </p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
