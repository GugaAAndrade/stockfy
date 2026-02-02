import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { categoryCreateSchema } from "@/lib/validators/category";
import { getSessionUser } from "@/lib/auth/session";
import * as notificationService from "@/lib/services/notifications";
import * as categoryService from "@/lib/services/categories";

export async function GET() {
  const data = await categoryService.listCategories({});
  return ok(data);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  const body = await request.json().catch(() => null);
  const parsed = categoryCreateSchema.safeParse(body);

  if (!parsed.success) {
    return fail(
      { code: "VALIDATION_ERROR", message: "Dados inválidos", details: parsed.error.flatten() },
      400
    );
  }

  const created = await categoryService.createCategory({}, parsed.data);
  await notificationService.createNotification(
    { userId: user?.id },
    "Categoria criada",
    `Categoria ${created.name} adicionada`
  );
  return ok(created, 201);
}
