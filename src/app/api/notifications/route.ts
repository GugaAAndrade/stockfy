import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { getSessionContext } from "@/lib/auth/session";
import * as notificationService from "@/lib/services/notifications";

export async function GET(request: NextRequest) {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }

  const unreadOnly = request.nextUrl.searchParams.get("unread") === "1";

  if (unreadOnly) {
    const count = await notificationService.countUnread({ userId: session.user.id, tenantId: session.tenantId });
    return ok({ count });
  }

  const data = await notificationService.listNotifications({ userId: session.user.id, tenantId: session.tenantId });
  return ok(data);
}

export async function POST() {
  const session = await getSessionContext();
  if (!session) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }

  await notificationService.markAllRead({ userId: session.user.id, tenantId: session.tenantId });
  return ok({});
}
