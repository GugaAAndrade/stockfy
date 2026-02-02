import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "StockFy",
  description: "Sistema de Gestão de Estoque",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
