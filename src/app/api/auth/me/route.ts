import { ok, fail } from "@/lib/api/response";
import { getSessionContext } from "@/lib/auth/session";

export async function GET() {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  return ok({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.role,
    tenantId: session.tenantId,
    tenant: session.tenant ? { id: session.tenant.id, name: session.tenant.name, slug: session.tenant.slug } : null,
  });
}
