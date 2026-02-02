import { ok } from "@/lib/api/response";
import { destroySession } from "@/lib/auth/session";

export async function POST() {
  await destroySession();
  return ok({});
}
