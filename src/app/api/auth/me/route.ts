import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/http";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Unauthorized", 401);
  return ok({ session });
}
