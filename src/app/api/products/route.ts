import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { productCreateSchema } from "@/lib/validators/product";
import { getSessionUser } from "@/lib/auth/session";
import * as notificationService from "@/lib/services/notifications";
import * as productService from "@/lib/services/products";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const data = await productService.listProducts({}, search);
  const mapped = data.map((product) => {
    const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    const totalMin = product.variants.reduce((sum, variant) => sum + variant.minStock, 0);
    const defaultVariant = product.variants.find((variant) => variant.isDefault) ?? product.variants[0];
    return {
      ...product,
      category: product.category?.name ?? "Sem categoria",
      categoryId: product.categoryId,
      sku: defaultVariant?.sku ?? "",
      stock: totalStock,
      minStock: totalMin,
      variants: product.variants,
    };
  });
  return ok(mapped);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  const body = await request.json().catch(() => null);
  const parsed = productCreateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos",
        details: parsed.error.flatten(),
      },
      400
    );
  }

  const created = await productService.createProduct({}, parsed.data);
  await notificationService.createNotification(
    { userId: user?.id },
    "Produto cadastrado",
    `Produto ${created.name} cadastrado com sucesso`
  );
  return ok(created, 201);
}
