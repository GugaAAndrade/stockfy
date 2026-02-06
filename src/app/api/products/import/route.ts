import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { buildSkuBase, limitSku } from "@/lib/services/sku";
import type { Prisma } from "@prisma/client";
import { getSessionContext } from "@/lib/auth/session";
import { withTenant } from "@/lib/db/tenant";
import { hasPermission } from "@/lib/auth/permissions";
import { logAudit } from "@/lib/audit";

async function ensureSku(
  client: Prisma.TransactionClient,
  tenantId: string,
  sku: string | undefined,
  productName: string
) {
  const trimmed = sku?.trim();
  if (trimmed) {
    const exists = await client.productVariant.findFirst({ where: { tenantId, sku: trimmed } });
    if (!exists) {
      return trimmed;
    }
  }

  const base = buildSkuBase({ prefix: process.env.SKU_PREFIX ?? "STK", productName, attributes: [] });
  let seq = 1;
  let candidate = limitSku(`${base}-${String(seq).padStart(3, "0")}`);
  while (await client.productVariant.findFirst({ where: { tenantId, sku: candidate } })) {
    seq += 1;
    candidate = limitSku(`${base}-${String(seq).padStart(3, "0")}`);
  }
  return candidate;
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    return [];
  }
  const headers = lines[0].split(",").map((header) => header.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map((line) => {
    const values = line
      .split(",")
      .map((value) => value.replace(/^"|"$/g, "").replace(/""/g, '"').trim());
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] ?? "";
      return acc;
    }, {});
  });
}

export async function POST(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  if (!hasPermission(session.role, "products:write")) {
    return fail({ code: "FORBIDDEN", message: "Sem permissão" }, 403);
  }

  const body = await request.text();
  if (!body) {
    return fail({ code: "EMPTY_FILE", message: "Arquivo vazio" }, 400);
  }

  const rows = parseCsv(body);
  if (!rows.length) {
    return fail({ code: "INVALID_CSV", message: "CSV inválido" }, 400);
  }

  const created = await withTenant(session.tenantId, async (tx) => {
    const results = [];
    for (const row of rows) {
      const categoryName = row.category || "Sem categoria";
      const category = await tx.category.upsert({
        where: { tenantId_name: { tenantId: session.tenantId, name: categoryName } },
        update: {},
        create: { name: categoryName, tenant: { connect: { id: session.tenantId } } },
      });

      const sku = await ensureSku(tx, session.tenantId, row.sku, row.name);
      const product = await tx.product.create({
        data: {
          tenant: { connect: { id: session.tenantId } },
          name: row.name,
          categoryId: category.id,
          unitPrice: Number(row.unitPrice),
          description: row.description || null,
        },
      });
      await tx.productVariant.create({
        data: {
          tenant: { connect: { id: session.tenantId } },
          product: { connect: { id: product.id } },
          sku,
          attributes: [],
          stock: Number(row.stock ?? 0),
          minStock: Number(row.minStock ?? 0),
          isDefault: true,
        },
      });
      results.push(product);
    }
    return results;
  });

  await withTenant(session.tenantId, (tx) =>
    logAudit(tx, {
      tenantId: session.tenantId,
      userId: session.user.id,
      action: "product.imported",
      entity: "product",
      metadata: { count: created.length },
    })
  );

  return ok({ count: created.length });
}
