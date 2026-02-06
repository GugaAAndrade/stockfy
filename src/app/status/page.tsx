export default function StatusPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Status</p>
        <h1 className="text-2xl font-semibold text-foreground">StockFy</h1>
        <p className="text-sm text-muted-foreground">
          Use o endpoint <span className="font-medium text-foreground">/api/health</span> para
          verificar a saúde do sistema.
        </p>
      </div>
    </div>
  );
}
