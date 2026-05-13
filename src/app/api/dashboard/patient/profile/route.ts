import { connectDb } from "@/lib/server";
import { fail, ok } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { patientProfileUpdateSchema } from "@/lib/validators";
import { findPatientByUserId, updatePatientProfile, updateUserBasics } from "@/repositories/patient-repository";

export async function PATCH(req: Request) {
  try {
    const session = await requireRole(["patient"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const body = await req.json();
    const parsed = patientProfileUpdateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payload");

    const patient = await findPatientByUserId(session.userId);
    if (!patient) return fail("Patient profile not found.", 404);

    const { name, phone, dob, medicalHistory, allergies, emergencyContact } = parsed.data;

    if (name !== undefined || phone !== undefined) {
      await updateUserBasics(session.userId, { ...(name !== undefined && { name }), ...(phone !== undefined && { phone }) });
    }

    const dobDate = dob ? new Date(dob) : undefined;
    if (dobDate && Number.isNaN(dobDate.getTime())) return fail("Invalid date of birth.");

    await updatePatientProfile(String(patient._id), {
      ...(dobDate && !Number.isNaN(dobDate.getTime()) ? { dob: dobDate } : {}),
      ...(medicalHistory !== undefined ? { medicalHistory } : {}),
      ...(allergies !== undefined ? { allergies } : {}),
      ...(emergencyContact !== undefined ? { emergencyContact } : {}),
    });

    return ok({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Update failed", 500);
  }
}
