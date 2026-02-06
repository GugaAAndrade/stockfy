import { prisma } from "@/lib/db/prisma";
import { withTenant } from "@/lib/db/tenant";
import type { LoginInput, RegisterInput } from "@/lib/validators/auth";
import bcrypt from "bcryptjs";

export async function registerUser(input: RegisterInput) {
  const [existingUser, existingTenant] = await Promise.all([
    prisma.user.findUnique({ where: { email: input.email } }),
    prisma.tenant.findUnique({ where: { slug: input.tenantSlug } }),
  ]);
  if (existingUser) {
    throw new Error("EMAIL_IN_USE");
  }
  if (existingTenant) {
    throw new Error("TENANT_IN_USE");
  }

  const password = await bcrypt.hash(input.password, 10);

  return prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: input.tenantName,
        slug: input.tenantSlug,
        subscriptionStatus: "pending",
      },
    });

    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        password,
      },
    });

    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenant.id}, true)`;
    await tx.tenantUser.create({
      data: {
        tenant: { connect: { id: tenant.id } },
        user: { connect: { id: user.id } },
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    return { user, tenant };
  });
}

export async function authenticateUser(input: LoginInput, tenantId: string) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    return null;
  }
  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    return null;
  }

  const membership = await withTenant(tenantId, (tx) =>
    tx.tenantUser.findFirst({
      where: { userId: user.id, tenantId },
    })
  );
  if (!membership || membership.status !== "ACTIVE") {
    throw new Error("NO_MEMBERSHIP");
  }

  return { user, role: membership.role };
}
