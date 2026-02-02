import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { loginSchema } from "@/lib/validators/auth";
import { authenticateUser } from "@/lib/services/auth";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
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

  const user = await authenticateUser(parsed.data);
  if (!user) {
    return fail({ code: "INVALID_CREDENTIALS", message: "Email ou senha inválidos" }, 401);
  }

  await createSession(user.id);
  return ok({ id: user.id, name: user.name, email: user.email, role: user.role });
}
