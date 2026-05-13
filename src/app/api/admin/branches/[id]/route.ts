import { connectDb } from "@/lib/server";
import { fail, ok } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { branchUpdateSchema } from "@/lib/validators";
import { Branch } from "@/models";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = branchUpdateSchema.safeParse({ ...body, id });
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payload");

    const { id: bodyId, code, ...rest } = parsed.data;
    if (bodyId !== id) return fail("ID mismatch.", 400);
    const update: Record<string, unknown> = { ...rest };
    if (code) update.code = code.toUpperCase();

    const branch = await Branch.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { $set: update },
      { new: true }
    ).lean();
    if (!branch) return fail("Branch not found.", 404);
    return ok({ branch });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Update failed";
    if (String(msg).includes("E11000")) return fail("Branch code already exists.", 409);
    return fail(msg, 500);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const { id } = await ctx.params;
    const branch = await Branch.findOneAndUpdate(
      { _id: id, deletedAt: { $exists: false } },
      { $set: { deletedAt: new Date(), active: false } },
      { new: true }
    ).lean();
    if (!branch) return fail("Branch not found.", 404);
    return ok({ branch });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Delete failed", 500);
  }
}
