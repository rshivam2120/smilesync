import { connectDb } from "@/lib/server";
import { ok, fail } from "@/lib/http";
import { consultationPrescriptionSchema } from "@/lib/validators";
import { requireRole } from "@/lib/auth";
import { getConsultation, generateAndPersistPrescription } from "@/repositories/consultation-repository";
import { buildPrescriptionDraft } from "@/services/prescription-service";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["patient", "dentist", "admin"]);
    if (!session) return fail("Unauthorized", 401);

    await connectDb();
    const { id } = await params;
    const body = await req.json();
    const parsed = consultationPrescriptionSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payload");

    const consultation = await getConsultation({ consultationId: id });
    if (!consultation) return fail("Consultation not found.", 404);

    const combinedNotes = [consultation.notes, parsed.data.notes].filter(Boolean).join("\\n\\n");
    const draft = buildPrescriptionDraft(combinedNotes);

    const result = await generateAndPersistPrescription({ consultationId: id, draft });
    return ok({ prescription: result.prescription, consultation: result.consultation });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Prescription generation failed", 500);
  }
}

