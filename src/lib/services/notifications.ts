import * as noticeDb from "@/lib/db/notifications";
import type { ServiceContext } from "@/lib/services/products";
import { withTenant } from "@/lib/db/tenant";

export async function listNotifications(ctx: ServiceContext) {
  if (!ctx.userId || !ctx.tenantId) {
    return [];
  }
  return withTenant(ctx.tenantId, (tx) => noticeDb.listNotifications(tx, ctx.tenantId!, ctx.userId!));
}

export async function countUnread(ctx: ServiceContext) {
  if (!ctx.userId || !ctx.tenantId) {
    return 0;
  }
  return withTenant(ctx.tenantId, (tx) => noticeDb.countUnread(tx, ctx.tenantId!, ctx.userId!));
}

export async function markAllRead(ctx: ServiceContext) {
  if (!ctx.userId || !ctx.tenantId) {
    return null;
  }
  return withTenant(ctx.tenantId, (tx) => noticeDb.markAllRead(tx, ctx.tenantId!, ctx.userId!));
}

export async function createNotification(ctx: ServiceContext, title: string, message: string) {
  if (!ctx.userId || !ctx.tenantId) {
    return null;
  }
  return withTenant(ctx.tenantId, (tx) =>
    noticeDb.createNotification(tx, ctx.tenantId!, ctx.userId!, title, message)
  );
}
