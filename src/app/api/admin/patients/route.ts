import { connectDb } from "@/lib/server";
import { fail, ok } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { listPatientsWithUsers } from "@/repositories/patient-repository";

export async function GET() {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const patients = await listPatientsWithUsers();
    return ok({ patients });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to list patients", 500);
  }
}
