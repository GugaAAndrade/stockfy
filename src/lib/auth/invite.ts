import { createHmac, timingSafeEqual } from "crypto";

type InvitePayload = {
  t: string;
  u: string;
  exp: number;
};

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const padded = pad ? normalized + "=".repeat(4 - pad) : normalized;
  return Buffer.from(padded, "base64").toString("utf8");
}

function getInviteSecret() {
  const secret = process.env.INVITE_TOKEN_SECRET;
  if (!secret) {
    throw new Error("INVITE_SECRET_MISSING");
  }
  return secret;
}

export function createInviteToken(tenantId: string, userId: string, expiresAt: Date) {
  const payload: InvitePayload = {
    t: tenantId,
    u: userId,
    exp: Math.floor(expiresAt.getTime() / 1000),
  };
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", getInviteSecret()).update(payloadEncoded).digest("base64");
  const signatureEncoded = signature.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${payloadEncoded}.${signatureEncoded}`;
}

export function verifyInviteToken(token: string) {
  const [payloadEncoded, signatureEncoded] = token.split(".");
  if (!payloadEncoded || !signatureEncoded) {
    return null;
  }
  const expected = createHmac("sha256", getInviteSecret()).update(payloadEncoded).digest("base64");
  const expectedEncoded = expected.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const expectedBuffer = Buffer.from(expectedEncoded);
  const signatureBuffer = Buffer.from(signatureEncoded);
  if (expectedBuffer.length !== signatureBuffer.length) {
    return null;
  }
  if (!timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }

  let payload: InvitePayload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadEncoded)) as InvitePayload;
  } catch {
    return null;
  }
  if (!payload?.t || !payload?.u || !payload?.exp) {
    return null;
  }
  if (payload.exp * 1000 < Date.now()) {
    return null;
  }
  return { tenantId: payload.t, userId: payload.u, expiresAt: new Date(payload.exp * 1000) };
}
