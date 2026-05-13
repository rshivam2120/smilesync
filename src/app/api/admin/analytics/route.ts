import { connectDb } from "@/lib/server";
import { fail, ok } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { buildAdminAnalytics } from "@/services/dashboard-admin-service";

export async function GET() {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const data = await buildAdminAnalytics();
    return ok(data);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load analytics", 500);
  }
}
