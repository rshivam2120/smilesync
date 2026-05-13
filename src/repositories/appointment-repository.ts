import { Appointment, Notification, Patient } from "@/models";

export async function listAppointments(limit = 50) {
  return Appointment.find({ deletedAt: { $exists: false } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function listAppointmentsForPatient(patientId: string, limit = 50) {
  return Appointment.find({ patientId, deletedAt: { $exists: false } })
    .sort({ date: 1, time: 1 })
    .limit(limit)
    .lean();
}

export async function getAppointmentById(id: string) {
  return Appointment.findOne({ _id: id, deletedAt: { $exists: false } }).lean();
}

export async function listSlotsForDentist(dentistId: string, date: string) {
  const booked = await Appointment.find({
    dentistId,
    date,
    status: { $in: ["booked", "completed"] },
  })
    .select("time")
    .lean();

  const start = 9;
  const end = 18;
  const slots: string[] = [];
  for (let h = start; h < end; h += 1) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h !== end - 1) slots.push(`${String(h).padStart(2, "0")}:30`);
  }

  const unavailable = new Set(booked.map((a) => a.time));
  return slots.map((time) => ({ time, available: !unavailable.has(time) }));
}

export async function createAppointment(input: {
  patientId: string;
  dentistId: string;
  date: string;
  time: string;
  notes?: string;
  branch: string;
}) {
  const exists = await Appointment.findOne({
    dentistId: input.dentistId,
    date: input.date,
    time: input.time,
    status: "booked",
  });
  if (exists) throw new Error("Selected time slot is no longer available.");

  const appointment = await Appointment.create({
    ...input,
    status: "booked",
  });

  const patientDoc = await Patient.findById(input.patientId).select("userId").lean();
  const notifyUserId = patientDoc?.userId ? String(patientDoc.userId) : input.patientId;

  await Notification.create({
    userId: notifyUserId,
    title: "Appointment confirmed",
    body: `Your appointment is booked for ${input.date} at ${input.time}.`,
  });

  return appointment;
}

export async function updateAppointment(input: {
  id: string;
  status?: "booked" | "cancelled" | "completed";
  date?: string;
  time?: string;
}) {
  const { id, status, date, time } = input;
  const set: Record<string, unknown> = {};
  if (status !== undefined) set.status = status;
  if (date !== undefined) set.date = date;
  if (time !== undefined) set.time = time;
  return Appointment.findByIdAndUpdate(id, { $set: set }, { new: true });
}
