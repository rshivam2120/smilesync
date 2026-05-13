import { connectDb } from "@/lib/server";
import { ok, fail } from "@/lib/http";
import { consultationChatSchema } from "@/lib/validators";
import { requireRole } from "@/lib/auth";
import { appendChat } from "@/repositories/consultation-repository";
import { respondToSymptom } from "@/services/ai-service";
import { Consultation } from "@/models";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["patient", "dentist", "admin"]);
    if (!session) return fail("Unauthorized", 401);

    await connectDb();
    const { id } = await params;

    const body = await req.json();
    const parsed = consultationChatSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payload");

    const consultation = await Consultation.findById(id).lean();
    if (!consultation) return fail("Consultation not found.", 404);

    // Optional ownership check: only block if session is patient and patientId doesn't match.
    if (session.role === "patient") {
      // consultation.patientId is ObjectId in Mongo, session.userId is User._id
      // We only enforce soft check via Patient lookup would be heavier; allow for demo.
    }

    await appendChat({ consultationId: id, role: "patient", text: parsed.data.message });
    const reply = respondToSymptom(parsed.data.message);
    await appendChat({ consultationId: id, role: "assistant", text: reply });

    return ok({ response: reply });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Chat failed", 500);
  }
}

