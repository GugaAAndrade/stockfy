import { ok, fail } from "@/lib/api/response";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  return ok({ id: user.id, name: user.name, email: user.email, role: user.role });
}
