import { connectDb } from "@/lib/server";
import { ok, fail } from "@/lib/http";
import { consultationNotesSchema } from "@/lib/validators";
import { requireRole } from "@/lib/auth";
import { updateNotes } from "@/repositories/consultation-repository";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["patient", "dentist", "admin"]);
    if (!session) return fail("Unauthorized", 401);

    await connectDb();
    const { id } = await params;
    const body = await req.json();
    const parsed = consultationNotesSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid notes", 400);

    const updated = await updateNotes({ consultationId: id, notes: parsed.data.notes });
    return ok({ consultation: updated });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to save notes", 500);
  }
}

