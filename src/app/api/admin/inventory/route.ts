import { connectDb } from "@/lib/server";
import { fail, ok } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { inventoryCreateSchema } from "@/lib/validators";
import { Branch, InventoryItem } from "@/models";

export async function GET(req: Request) {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");
    const q = InventoryItem.find({ deletedAt: { $exists: false } }).populate("branchId", "name code").sort({ name: 1 });
    if (branchId) q.where({ branchId });
    const items = await q.limit(500).lean();
    return ok({ items });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to list inventory", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const body = await req.json();
    const parsed = inventoryCreateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payload");

    const branch = await Branch.findOne({ _id: parsed.data.branchId, deletedAt: { $exists: false } }).lean();
    if (!branch) return fail("Branch not found.", 400);

    const item = await InventoryItem.create({
      branchId: parsed.data.branchId,
      sku: parsed.data.sku,
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit ?? "unit",
      reorderLevel: parsed.data.reorderLevel ?? 5,
    });
    return ok({ item }, 201);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Create failed", 500);
  }
}
