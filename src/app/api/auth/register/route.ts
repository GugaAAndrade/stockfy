import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { registerSchema } from "@/lib/validators/auth";
import { registerUser } from "@/lib/services/auth";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
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
    const user = await registerUser(parsed.data);
    await createSession(user.id);
    return ok({ id: user.id, name: user.name, email: user.email, role: user.role }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_IN_USE") {
      return fail({ code: "EMAIL_IN_USE", message: "Email já cadastrado" }, 409);
    }
    return fail({ code: "INTERNAL_ERROR", message: "Erro interno" }, 500);
  }
}
