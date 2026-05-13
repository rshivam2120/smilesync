import { connectDb } from "@/lib/server";
import { fail, ok } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { findPatientByUserId } from "@/repositories/patient-repository";
import { User } from "@/models";
import { buildPatientDashboardData } from "@/services/dashboard-patient-service";

export async function GET() {
  try {
    const session = await requireRole(["patient"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();

    const patient = await findPatientByUserId(session.userId);
    if (!patient) return fail("Patient profile not found.", 404);

    const user = await User.findById(session.userId).lean();
    const dashboard = await buildPatientDashboardData(String(patient._id), session.userId, {
      patientDob: patient.dob ?? undefined,
    });

    return ok({
      profile: {
        user: {
          id: session.userId,
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
        },
        patient: {
          id: String(patient._id),
          dob: patient.dob,
          medicalHistory: patient.medicalHistory,
          allergies: patient.allergies,
          emergencyContact: patient.emergencyContact,
        },
      },
      ...dashboard,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to load dashboard", 500);
  }
}
