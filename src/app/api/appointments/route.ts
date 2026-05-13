import { connectDb } from "@/lib/server";
import { fail, ok } from "@/lib/http";
import { appointmentCreateSchema, appointmentUpdateSchema, slotsSchema } from "@/lib/validators";
import {
  createAppointment,
  getAppointmentById,
  listAppointments,
  listAppointmentsForPatient,
  listSlotsForDentist,
  updateAppointment,
} from "@/repositories/appointment-repository";
import { requireRole } from "@/lib/auth";
import { Patient } from "@/models";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    const role = await requireRole(["admin", "dentist", "patient"]);
    if (!role) return fail("Unauthorized", 401);
    await connectDb();

    const { searchParams } = new URL(req.url);
    const dentistId = searchParams.get("dentistId");
    const date = searchParams.get("date");

    if (dentistId && date) {
      const parsed = slotsSchema.safeParse({ dentistId, date });
      if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid query");
      const slots = await listSlotsForDentist(dentistId, date);
      return ok({ slots });
    }

    if (role.role === "patient") {
      const profile = await Patient.findOne({
        userId: new mongoose.Types.ObjectId(role.userId),
        deletedAt: { $exists: false },
      })
        .select("_id")
        .lean();
      if (!profile) return fail("Patient profile not found.", 404);
      const appointments = await listAppointmentsForPatient(String(profile._id));
      return ok({ appointments });
    }

    const appointments = await listAppointments();
    return ok({ appointments });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to fetch appointments", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["admin", "dentist", "patient"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const body = await req.json();
    const parsed = appointmentCreateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid appointment payload");

    let patientId = parsed.data.patientId;
    if (session.role === "patient") {
      const profile = await Patient.findOne({
        userId: new mongoose.Types.ObjectId(session.userId),
        deletedAt: { $exists: false },
      }).exec();
      if (!profile) return fail("Patient profile not found. Contact clinic admin.", 400);
      patientId = String(profile._id);
    }

    if (!patientId) return fail("patientId is required for staff bookings.", 400);

    const appointment = await createAppointment({
      ...parsed.data,
      patientId,
    });
    return ok({ appointment }, 201);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to create appointment", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireRole(["admin", "dentist", "patient"]);
    if (!session) return fail("Unauthorized", 401);
    await connectDb();
    const body = await req.json();
    const parsed = appointmentUpdateSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid update payload");

    if (session.role === "patient") {
      const profile = await Patient.findOne({
        userId: new mongoose.Types.ObjectId(session.userId),
        deletedAt: { $exists: false },
      })
        .select("_id")
        .lean();
      if (!profile) return fail("Patient profile not found.", 404);
      const existing = await getAppointmentById(parsed.data.id);
      if (!existing) return fail("Appointment not found.", 404);
      if (existing.patientId !== String(profile._id)) return fail("Forbidden", 403);
    }

    const appointment = await updateAppointment(parsed.data);
    return ok({ appointment });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to update appointment", 500);
  }
}
