import { describe, expect, it, beforeEach } from "vitest";
import { createInviteToken, verifyInviteToken } from "@/lib/auth/invite";

describe("invite tokens", () => {
  beforeEach(() => {
    process.env.INVITE_TOKEN_SECRET = "test-secret";
  });

  it("cria e valida token", () => {
    const expiresAt = new Date(Date.now() + 60_000);
    const token = createInviteToken("tenant-1", "user-1", expiresAt);
    const decoded = verifyInviteToken(token);
    expect(decoded?.tenantId).toBe("tenant-1");
    expect(decoded?.userId).toBe("user-1");
  });

  it("token expirado retorna null", () => {
    const expiresAt = new Date(Date.now() - 60_000);
    const token = createInviteToken("tenant-1", "user-1", expiresAt);
    const decoded = verifyInviteToken(token);
    expect(decoded).toBeNull();
  });
});
