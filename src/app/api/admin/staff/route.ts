import { connectDb } from "@/lib/server";
import { fail, ok } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { staffCreateSchema } from "@/lib/validators";
import { Branch, Staff } from "@/models";

export async function GET(req: Request) {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");
    const q = Staff.find({ deletedAt: { $exists: false } }).populate("branchId", "name code").sort({ name: 1 });
    if (branchId) q.where({ branchId });
    const staff = await q.limit(300).lean();
    return ok({ staff });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to list staff", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const body = await req.json();
    const parsed = staffCreateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payload");

    const branch = await Branch.findOne({ _id: parsed.data.branchId, deletedAt: { $exists: false } }).lean();
    if (!branch) return fail("Branch not found.", 400);

    const staff = await Staff.create({
      branchId: parsed.data.branchId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      title: parsed.data.title,
      active: parsed.data.active ?? true,
    });
    return ok({ staff }, 201);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Create failed", 500);
  }
}
