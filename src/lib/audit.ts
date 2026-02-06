import type { Prisma } from "@prisma/client";
import type { DbClient } from "@/lib/db/tenant";

export type AuditInput = {
  tenantId: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function logAudit(client: DbClient, input: AuditInput) {
  return client.auditLog.create({
    data: {
      tenant: { connect: { id: input.tenantId } },
      user: { connect: { id: input.userId } },
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      metadata: input.metadata ?? undefined,
    },
  });
}
