import { connectDb } from "@/lib/server";
import { fail, ok } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { notificationReadSchema } from "@/lib/validators";
import { Notification } from "@/models";

export async function PATCH(req: Request) {
  try {
    const session = await requireRole(["patient"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const body = await req.json();
    const parsed = notificationReadSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payload");

    const updated = await Notification.findOneAndUpdate(
      { _id: parsed.data.id, userId: session.userId, deletedAt: { $exists: false } },
      { $set: { read: parsed.data.read } },
      { new: true }
    ).lean();

    if (!updated) return fail("Notification not found.", 404);
    return ok({ notification: updated });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Update failed", 500);
  }
}
