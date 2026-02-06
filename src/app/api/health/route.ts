import { ok, fail } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { log } from "@/lib/logger";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({ status: "ok" });
  } catch (error) {
    log("error", "healthcheck_failed", { error: String(error) });
    return fail({ code: "HEALTHCHECK_FAILED", message: "Database unavailable" }, 503);
  }
}
