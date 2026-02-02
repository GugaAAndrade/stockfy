"use client";

import { useEffect, useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Header() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{ id: string; title: string; message: string; readAt: string | null }>
  >([]);

  const loadUnread = async () => {
    const response = await fetch("/api/notifications?unread=1");
    const payload = await response.json().catch(() => null);
    if (payload?.ok) {
      setUnreadCount(payload.data.count);
    }
  };

  const loadNotifications = async () => {
    const response = await fetch("/api/notifications");
    const payload = await response.json().catch(() => null);
    if (payload?.ok) {
      setNotifications(payload.data);
    }
  };

  useEffect(() => {
    loadUnread();
  }, []);

  const onSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    router.push(`/produtos${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 h-16 bg-card border-b border-border backdrop-blur-sm bg-card/80"
    >
      <div className="h-full flex items-center justify-between px-4 md:px-8">
        <div className="flex-1 max-w-xl">
          <form onSubmit={onSearchSubmit} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produtos, fornecedores..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-secondary rounded-xl border border-transparent focus:border-primary focus:bg-background transition-all outline-none text-foreground placeholder:text-muted-foreground"
            />
          </form>
          <div className="sm:hidden">
            <h2 className="text-lg font-semibold text-foreground">StockFy</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="sm:hidden h-10 w-10 rounded-xl bg-secondary hover:bg-muted transition-colors flex items-center justify-center"
            type="button"
          >
            <Search className="h-5 w-5 text-foreground" />
          </motion.button>

          <ThemeToggle />

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-10 w-10 rounded-xl bg-secondary hover:bg-muted transition-colors flex items-center justify-center"
              type="button"
              onClick={() => {
                const next = !showNotifications;
                setShowNotifications(next);
                if (next) {
                  loadNotifications();
                }
              }}
            >
              <Bell className="h-5 w-5 text-foreground" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />}
            </motion.button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-border bg-card shadow-lg p-4 z-50">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">Notificações</p>
                  <Link href="/notificacoes" className="text-xs text-primary hover:underline">
                    Ver tudo
                  </Link>
                </div>
                <div className="space-y-2 max-h-64 overflow-auto pr-1">
                  {notifications.length === 0 && (
                    <p className="text-xs text-muted-foreground">Nenhuma notificação.</p>
                  )}
                  {notifications.map((notice) => (
                    <div
                      key={notice.id}
                      className={`rounded-xl border px-3 py-2 ${
                        notice.readAt ? "border-border" : "border-primary/40 bg-primary/5"
                      }`}
                    >
                      <p className="text-xs font-semibold text-foreground">{notice.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notice.message}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-3 w-full h-9 rounded-xl border border-border text-xs text-foreground hover:bg-muted transition-colors"
                  onClick={async () => {
                    await fetch("/api/notifications", { method: "POST" });
                    setShowNotifications(false);
                    loadUnread();
                  }}
                >
                  Marcar como lidas
                </button>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden sm:flex items-center gap-3 h-11 pl-2 pr-3 rounded-xl bg-secondary hover:bg-muted transition-colors"
            type="button"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="font-medium text-primary-foreground">AD</span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-foreground">Admin</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="sm:hidden h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
            type="button"
          >
            <span className="text-sm font-medium text-primary-foreground">AD</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
