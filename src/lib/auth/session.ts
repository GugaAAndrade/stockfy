import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { randomBytes } from "crypto";

const sessionCookie = "stockfy_session";
const sessionDurationDays = 7;

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + sessionDurationDays);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  cookieStore.set(sessionCookie, "", { path: "/", maxAge: 0 });
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}
