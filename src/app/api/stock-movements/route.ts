import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { movementCreateSchema } from "@/lib/validators/stock-movement";
import { getSessionUser } from "@/lib/auth/session";
import * as notificationService from "@/lib/services/notifications";
import * as movementService from "@/lib/services/stock-movements";

export async function GET() {
  const data = await movementService.listMovements({});
  return ok(data);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  const body = await request.json().catch(() => null);
  const parsed = movementCreateSchema.safeParse(body);

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

  try {
    const movement = await movementService.createMovement({}, parsed.data);
    if (!movement) {
      return fail({ code: "NOT_FOUND", message: "Produto não encontrado" }, 404);
    }
    await notificationService.createNotification(
      { userId: user?.id },
      "Movimentação registrada",
      movement.type === "IN" ? "Entrada de estoque registrada" : "Saída de estoque registrada"
    );
    return ok(movement, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "STOCK_NEGATIVE") {
      return fail({ code: "STOCK_NEGATIVE", message: "Estoque insuficiente" }, 400);
    }
    return fail({ code: "INTERNAL_ERROR", message: "Erro interno" }, 500);
  }
}
