import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { getSessionUser } from "@/lib/auth/session";
import * as notificationService from "@/lib/services/notifications";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }

  const unreadOnly = request.nextUrl.searchParams.get("unread") === "1";

  if (unreadOnly) {
    const count = await notificationService.countUnread({ userId: user.id });
    return ok({ count });
  }

  const data = await notificationService.listNotifications({ userId: user.id });
  return ok(data);
}

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return fail({ code: "UNAUTHENTICATED", message: "Não autenticado" }, 401);
  }

  await notificationService.markAllRead({ userId: user.id });
  return ok({});
}
