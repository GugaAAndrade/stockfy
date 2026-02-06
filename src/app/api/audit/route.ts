import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { getSessionContext } from "@/lib/auth/session";
import { withTenant } from "@/lib/db/tenant";
import { hasPermission } from "@/lib/auth/permissions";

export async function GET(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }
  if (!hasPermission(session.role, "users:manage")) {
    return fail({ code: "FORBIDDEN", message: "Sem permissão" }, 403);
  }

  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const action = request.nextUrl.searchParams.get("action")?.trim() ?? "";
  const from = request.nextUrl.searchParams.get("from") ?? "";
  const to = request.nextUrl.searchParams.get("to") ?? "";

  const createdAt =
    from || to
      ? {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        }
      : undefined;

  const where = {
    tenantId: session.tenantId,
    ...(action ? { action } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(search
      ? {
          OR: [
            { action: { contains: search, mode: "insensitive" as const } },
            { entity: { contains: search, mode: "insensitive" as const } },
            { user: { name: { contains: search, mode: "insensitive" as const } } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const logs = await withTenant(session.tenantId, (tx) =>
    tx.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: true },
    })
  );

  return ok(
    logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      metadata: log.metadata,
      createdAt: log.createdAt,
      user: { id: log.user.id, name: log.user.name, email: log.user.email },
    }))
  );
}
