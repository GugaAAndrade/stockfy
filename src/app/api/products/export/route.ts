import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session";
import { withTenant } from "@/lib/db/tenant";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return new NextResponse("Não autenticado", { status: 401 });
  }

  const products = await withTenant(session.tenantId, (tx) =>
    tx.product.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: "desc" },
      include: { category: true, variants: true },
    })
  );
  await withTenant(session.tenantId, (tx) =>
    logAudit(tx, {
      tenantId: session.tenantId,
      userId: session.user.id,
      action: "product.exported",
      entity: "product",
      metadata: { count: products.length },
    })
  );

  const header = ["name", "sku", "category", "unitPrice", "stock", "minStock", "description"].join(",");
  const rows = products.map((product) => {
    const defaultVariant = product.variants.find((variant) => variant.isDefault) ?? product.variants[0];
    return [
      product.name,
      defaultVariant?.sku ?? "",
      product.category?.name ?? "Sem categoria",
      product.unitPrice.toString(),
      defaultVariant?.stock ?? 0,
      defaultVariant?.minStock ?? 0,
      product.description ?? "",
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=stockfy-produtos.csv",
    },
  });
}
