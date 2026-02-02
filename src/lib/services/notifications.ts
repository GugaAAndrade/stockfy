import * as noticeDb from "@/lib/db/notifications";
import type { ServiceContext } from "@/lib/services/products";

export async function listNotifications(ctx: ServiceContext) {
  if (!ctx.userId) {
    return [];
  }
  return noticeDb.listNotifications(ctx.userId);
}

export async function countUnread(ctx: ServiceContext) {
  if (!ctx.userId) {
    return 0;
  }
  return noticeDb.countUnread(ctx.userId);
}

export async function markAllRead(ctx: ServiceContext) {
  if (!ctx.userId) {
    return null;
  }
  return noticeDb.markAllRead(ctx.userId);
}

export async function createNotification(ctx: ServiceContext, title: string, message: string) {
  if (!ctx.userId) {
    return null;
  }
  return noticeDb.createNotification(ctx.userId, title, message);
}
