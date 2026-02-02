import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true },
  });

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
