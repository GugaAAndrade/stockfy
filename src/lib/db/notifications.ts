import type { DbClient } from "@/lib/db/tenant";

export function listNotifications(client: DbClient, tenantId: string, userId: string) {
  return client.notification.findMany({
    where: { tenantId, userId },
    orderBy: { createdAt: "desc" },
  });
}

export function countUnread(client: DbClient, tenantId: string, userId: string) {
  return client.notification.count({
    where: { tenantId, userId, readAt: null },
  });
}

export function markAllRead(client: DbClient, tenantId: string, userId: string) {
  return client.notification.updateMany({
    where: { tenantId, userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export function createNotification(client: DbClient, tenantId: string, userId: string, title: string, message: string) {
  return client.notification.create({
    data: {
      tenantId,
      userId,
      title,
      message,
    },
  });
}
