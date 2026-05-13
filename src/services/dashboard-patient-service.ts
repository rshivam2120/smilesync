import mongoose from "mongoose";
import {
  Appointment,
  Membership,
  Notification,
  Payment,
  Prescription,
  Report,
  Treatment,
} from "@/models";
import { buildSmileAnalysis } from "@/services/ai-service";

function ageFromDob(dob?: Date | null) {
  if (!dob) return 28;
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.max(5, Math.min(100, Math.floor(diff / (365.25 * 24 * 3600 * 1000))));
}

export async function buildPatientDashboardData(
  patientId: string,
  userId: string,
  options?: { patientDob?: Date | null }
) {
  const pid = patientId;
  const uid = new mongoose.Types.ObjectId(userId);
  const [
    appointments,
    treatments,
    prescriptions,
    reports,
    payments,
    notifications,
    membership,
  ] = await Promise.all([
    Appointment.find({ patientId: pid, deletedAt: { $exists: false } })
      .sort({ date: 1, time: 1 })
      .limit(80)
      .lean(),
    Treatment.find({ patientId, deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    Prescription.find({ patientId, deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
    Report.find({ patientId, deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
    Payment.find({ userId, deletedAt: { $exists: false } }).sort({ createdAt: -1 }).limit(50).lean(),
    Notification.find({ userId, deletedAt: { $exists: false } }).sort({ createdAt: -1 }).limit(40).lean(),
    Membership.findOne({ userId: uid, deletedAt: { $exists: false }, active: true }).sort({ endsAt: -1 }).lean(),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appointments.filter((a) => a.status === "booked" && a.date >= today);
  const past = appointments.filter((a) => a.status !== "booked" || a.date < today);

  const progressValues = treatments.map((t) => t.progress ?? 0).filter((n) => typeof n === "number");
  const smileProgress =
    progressValues.length > 0 ? Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length) : 72;

  const concern =
    treatments[0]?.serviceSlug?.replace(/-/g, " ") ||
    reports[0]?.type?.toLowerCase() ||
    "general care";

  const analysis = buildSmileAnalysis(ageFromDob(options?.patientDob), concern);

  const aiRecommendations = [
    ...analysis.recommendations,
    ...(reports[0]?.aiSimplified ? [`Latest report insight: ${reports[0].aiSimplified}`] : []),
  ].slice(0, 6);

  const invoices = payments.map((p) => ({
    id: String(p._id),
    label: `INV-${String(p._id).slice(-6).toUpperCase()}`,
    amount: p.amount ?? 0,
    currency: p.currency ?? "INR",
    status: p.status,
    purpose: p.purpose ?? "payment",
    createdAt: p.createdAt,
  }));

  return {
    appointments: { all: appointments, upcoming, past },
    treatments,
    prescriptions,
    reports,
    payments,
    invoices,
    notifications,
    membership,
    smileProgress,
    aiRecommendations,
    smileScores: {
      alignment: analysis.alignment,
      whitening: analysis.whitening,
      gumHealth: analysis.gumHealth,
      symmetry: analysis.symmetry,
      confidence: analysis.confidence,
    },
  };
}
