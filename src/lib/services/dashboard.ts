import { withTenant } from "@/lib/db/tenant";
import type { ServiceContext } from "@/lib/services/products";

const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export async function getDashboardSummary(ctx: ServiceContext) {
  if (!ctx.tenantId) {
    return {
      totalStock: 0,
      lowStock: 0,
      entradasMes: 0,
      saidasMes: 0,
      entradasChange: 0,
      saidasChange: 0,
    };
  }

  return withTenant(ctx.tenantId, async (tx) => {
    const variants = await tx.productVariant.findMany({
      where: { tenantId: ctx.tenantId! },
      select: { stock: true, minStock: true },
    });

    const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    const lowStock = variants.filter((variant) => variant.stock <= variant.minStock).length;

    const now = new Date();
    const currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    const previousStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60);

    const [currentMovements, previousMovements] = await Promise.all([
      tx.stockMovement.findMany({
        where: { tenantId: ctx.tenantId!, createdAt: { gte: currentStart } },
        select: { type: true },
      }),
      tx.stockMovement.findMany({
        where: { tenantId: ctx.tenantId!, createdAt: { gte: previousStart, lt: currentStart } },
        select: { type: true },
      }),
    ]);

  const countByType = (list: { type: "IN" | "OUT" }[], type: "IN" | "OUT") =>
    list.filter((movement) => movement.type === type).length;

  const entradasMes = countByType(currentMovements, "IN");
  const saidasMes = countByType(currentMovements, "OUT");

  const entradasPrev = countByType(previousMovements, "IN");
  const saidasPrev = countByType(previousMovements, "OUT");

  const percentChange = (current: number, previous: number) => {
    if (previous === 0) {
      return 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  };

    return {
      totalStock,
      lowStock,
      entradasMes,
      saidasMes,
      entradasChange: percentChange(entradasMes, entradasPrev),
      saidasChange: percentChange(saidasMes, saidasPrev),
    };
  });
}

export async function getLiveMetrics(ctx: ServiceContext) {
  if (!ctx.tenantId) {
    return {
      totalValue: 0,
      movementsToday: 0,
      rotation: 0,
      avgRestockDays: 0,
    };
  }

  return withTenant(ctx.tenantId, async (tx) => {
    const variants = await tx.productVariant.findMany({
      where: { tenantId: ctx.tenantId! },
      select: { stock: true, product: { select: { unitPrice: true } } },
    });

    const totalValue = variants.reduce((sum, variant) => {
      const price = Number(variant.product.unitPrice);
      return sum + price * variant.stock;
    }, 0);

    const todayStart = startOfDay(new Date());
    const movementsToday = await tx.stockMovement.count({
      where: { tenantId: ctx.tenantId!, createdAt: { gte: todayStart } },
    });

    const last30Start = new Date();
    last30Start.setDate(last30Start.getDate() - 30);
    const movementsLast30 = await tx.stockMovement.count({
      where: { tenantId: ctx.tenantId!, createdAt: { gte: last30Start } },
    });

    const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    const rotation = totalStock > 0 ? Math.round((movementsLast30 / totalStock) * 100) : 0;

    return {
      totalValue,
      movementsToday,
      rotation,
      avgRestockDays: 0,
    };
  });
}

export async function getCharts(ctx: ServiceContext) {
  if (!ctx.tenantId) {
    return { lineData: [], barData: [] };
  }

  return withTenant(ctx.tenantId, async (tx) => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => addMonths(now, -5 + index));
    const monthKeys = months.map(monthKey);

    const movements = await tx.stockMovement.findMany({
      where: { tenantId: ctx.tenantId!, createdAt: { gte: addMonths(now, -5) } },
      select: { type: true, createdAt: true, quantity: true },
    });

  const movementByMonth = monthKeys.reduce<Record<string, { entradas: number; saidas: number }>>(
    (acc, key) => {
      acc[key] = { entradas: 0, saidas: 0 };
      return acc;
    },
    {}
  );

  movements.forEach((movement) => {
    const key = monthKey(movement.createdAt);
    const bucket = movementByMonth[key];
    if (!bucket) {
      return;
    }
    if (movement.type === "IN") {
      bucket.entradas += movement.quantity;
    } else {
      bucket.saidas += movement.quantity;
    }
  });

  const lineData = months.map((date) => {
    const key = monthKey(date);
    const values = movementByMonth[key] ?? { entradas: 0, saidas: 0 };
    return {
      name: monthLabels[date.getMonth()],
      entradas: values.entradas,
      saidas: values.saidas,
    };
  });

    const variants = await tx.productVariant.findMany({
      where: { tenantId: ctx.tenantId! },
      select: { stock: true, product: { select: { category: { select: { name: true } } } } },
    });

  const byCategory = variants.reduce<Record<string, number>>((acc, variant) => {
    const key = variant.product.category?.name ?? "Outros";
    acc[key] = (acc[key] ?? 0) + variant.stock;
    return acc;
  }, {});

    const barData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

    return { lineData, barData };
  });
}

export async function getRecentActivity(ctx: ServiceContext) {
  if (!ctx.tenantId) {
    return [];
  }

  const movements = await withTenant(ctx.tenantId, (tx) =>
    tx.stockMovement.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { variant: { include: { product: true } } },
    })
  );

  return movements.map((movement, index) => {
    const label = movement.type === "IN" ? "Entrada de estoque" : "Saída de estoque";
    return {
      id: `${movement.id}-${index}`,
      type: movement.type === "IN" ? "entrada" : "saida",
      description: label,
      user: "Sistema",
      time: "agora",
      product: movement.variant?.product?.name ?? "Produto",
      quantity: movement.quantity,
    };
  });
}
