import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("permite até o limite", () => {
    const limit = 3;
    const windowMs = 1000;
    const key = "test:1";

    const r1 = rateLimit(key, limit, windowMs);
    const r2 = rateLimit(key, limit, windowMs);
    const r3 = rateLimit(key, limit, windowMs);
    const r4 = rateLimit(key, limit, windowMs);

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
    expect(r4.allowed).toBe(false);
  });

  it("reseta após a janela", () => {
    const limit = 2;
    const windowMs = 1000;
    const key = "test:2";

    rateLimit(key, limit, windowMs);
    rateLimit(key, limit, windowMs);
    const blocked = rateLimit(key, limit, windowMs);
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(1001);
    const after = rateLimit(key, limit, windowMs);
    expect(after.allowed).toBe(true);
  });
});
