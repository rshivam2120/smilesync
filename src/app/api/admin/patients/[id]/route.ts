import { connectDb } from "@/lib/server";
import { fail, ok } from "@/lib/http";
import { requireRole } from "@/lib/auth";
import { adminPatientUpdateSchema } from "@/lib/validators";
import {
  findPatientById,
  softDeletePatient,
  updatePatientProfile,
  updateUserBasics,
} from "@/repositories/patient-repository";
import { findUserByEmail } from "@/repositories/user-repository";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const { id } = await ctx.params;
    const patient = await findPatientById(id);
    if (!patient) return fail("Patient not found.", 404);

    const body = await req.json();
    const parsed = adminPatientUpdateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payload");

    const { name, email, phone, dob, medicalHistory, allergies, emergencyContact } = parsed.data;

    if (email) {
      const existing = await findUserByEmail(email);
      if (existing && String(existing._id) !== String(patient.userId)) {
        return fail("Another account already uses this email.", 409);
      }
    }

    if (name !== undefined || email !== undefined || phone !== undefined) {
      await updateUserBasics(String(patient.userId), {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
      });
    }

    const dobDate = dob ? new Date(dob) : undefined;
    if (dob && dobDate && Number.isNaN(dobDate.getTime())) return fail("Invalid date of birth.");

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

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const session = await requireRole(["admin", "dentist"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const { id } = await ctx.params;
    const patient = await softDeletePatient(id);
    if (!patient) return fail("Patient not found.", 404);
    return ok({ patient });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Delete failed", 500);
  }
}
