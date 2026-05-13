import { connectDb } from "@/lib/server";
import { ok, fail } from "@/lib/http";
import { consultationCreateSchema } from "@/lib/validators";
import { requireRole } from "@/lib/auth";
import { createConsultation } from "@/repositories/consultation-repository";
import { Patient } from "@/models";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await requireRole(["patient", "dentist", "admin"]);
    if (!session) return fail("Unauthorized", 401);
    const body = await req.json();
    const parsed = consultationCreateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payload");

    await connectDb();

    // For now, patient starts the consultation; staff can extend later.
    if (session.role !== "patient") {
      return fail("Only patient can start consultation.", 403);
    }

    const patient = await Patient.findOne({
      userId: new mongoose.Types.ObjectId(session.userId),
      deletedAt: { $exists: false },
    }).exec();

    if (!patient) return fail("Patient profile not found.", 400);

    const consultation = await createConsultation({
      patientId: String(patient._id),
      dentistId: parsed.data.dentistId,
    });

    return ok({ consultation }, 201);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to create consultation", 500);
  }
}

