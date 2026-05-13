import { connectDb } from "@/lib/server";
import { fail, ok } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { branchCreateSchema } from "@/lib/validators";
import { Branch } from "@/models";

export async function GET() {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const branches = await Branch.find({ deletedAt: { $exists: false } }).sort({ name: 1 }).lean();
    return ok({ branches });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to list branches", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const body = await req.json();
    const parsed = branchCreateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payload");

    const code = parsed.data.code.toUpperCase();
    const branch = await Branch.create({
      name: parsed.data.name,
      code,
      address: parsed.data.address,
      phone: parsed.data.phone,
      active: parsed.data.active ?? true,
    });
    return ok({ branch }, 201);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Create failed";
    if (String(msg).includes("E11000")) return fail("Branch code already exists.", 409);
    return fail(msg, 500);
  }
}
