import { connectDb } from "@/lib/server";
import { fail, ok } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { staffUpdateSchema } from "@/lib/validators";
import { Branch, Staff } from "@/models";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = staffUpdateSchema.safeParse({ ...body, id });
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payload");

    if (parsed.data.branchId) {
      const branch = await Branch.findOne({ _id: parsed.data.branchId, deletedAt: { $exists: false } }).lean();
      if (!branch) return fail("Branch not found.", 400);
    }

    const { id: bodyId, ...update } = parsed.data;
    if (bodyId !== id) return fail("ID mismatch.", 400);
    const staff = await Staff.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { $set: update },
      { new: true }
    ).lean();
    if (!staff) return fail("Staff not found.", 404);
    return ok({ staff });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Update failed", 500);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const { id } = await ctx.params;
    const staff = await Staff.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { $set: { deletedAt: new Date(), active: false } },
      { new: true }
    ).lean();
    if (!staff) return fail("Staff not found.", 404);
    return ok({ staff });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Delete failed", 500);
  }
}
