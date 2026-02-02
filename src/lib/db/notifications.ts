import { prisma } from "@/lib/db/prisma";

export function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export function countUnread(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export function createNotification(userId: string, title: string, message: string) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
}
