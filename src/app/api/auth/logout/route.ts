import { ok } from "@/lib/api/response";
import { destroySession, getSessionContext } from "@/lib/auth/session";
import { withTenant } from "@/lib/db/tenant";
import { logAudit } from "@/lib/audit";

export async function POST() {
  const session = await getSessionContext({ allowInactive: true });
  if (session) {
    await withTenant(session.tenantId, (tx) =>
      logAudit(tx, {
        tenantId: session.tenantId,
        userId: session.user.id,
        action: "auth.logout",
        entity: "user",
        entityId: session.user.id,
      })
    );
  }
  await destroySession();
  return ok({});
}
