import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { randomBytes } from "crypto";
import { withTenant } from "@/lib/db/tenant";

const sessionCookie = "stockfy_session";
const tenantCookie = "stockfy_tenant";
const sessionDurationDays = 7;

export async function setTenantCookie(tenantId: string) {
  const cookieStore = await cookies();
  cookieStore.set(tenantCookie, tenantId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function createSession(userId: string, tenantId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + sessionDurationDays);

  await withTenant(tenantId, (tx) =>
    tx.session.create({
      data: {
        token,
        userId,
        tenantId,
        expiresAt,
      },
    })
  );

  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  cookieStore.set(tenantCookie, tenantId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  const tenantId = cookieStore.get(tenantCookie)?.value;
  if (token) {
    if (tenantId) {
      await withTenant(tenantId, (tx) => tx.session.deleteMany({ where: { token } }));
    } else {
      await prisma.session.deleteMany({ where: { token } });
    }
  }
  cookieStore.set(sessionCookie, "", { path: "/", maxAge: 0 });
  cookieStore.set(tenantCookie, "", { path: "/", maxAge: 0 });
}

export async function getSessionContext() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  const tenantId = cookieStore.get(tenantCookie)?.value;
  if (!token || !tenantId) {
    return null;
  }

  const { session, membership, tenant } = await withTenant(tenantId, async (tx) => {
    const sessionRecord = await tx.session.findFirst({
      where: { token, tenantId },
      include: { user: true },
    });
    if (!sessionRecord || sessionRecord.expiresAt < new Date()) {
      return { session: null, membership: null, tenant: null };
    }
    const membershipRecord = await tx.tenantUser.findFirst({
      where: { userId: sessionRecord.userId, tenantId },
    });
    const tenantRecord = await tx.tenant.findUnique({ where: { id: tenantId } });
    return { session: sessionRecord, membership: membershipRecord, tenant: tenantRecord };
  });

  if (!session || !membership || membership.status !== "ACTIVE") {
    return null;
  }

  return { user: session.user, tenantId, role: membership.role, tenant };
}

export async function getTenantFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(tenantCookie)?.value ?? null;
}
