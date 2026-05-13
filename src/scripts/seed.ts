import "./load-env";
import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/server";
import {
  Appointment,
  Branch,
  Consultation,
  Dentist,
  InventoryItem,
  Membership,
  NewsletterSubscriber,
  Notification,
  Patient,
  Payment,
  Prescription,
  Report,
  Staff,
  Treatment,
  User,
} from "@/models";

const DEMO_PASSWORD = "Demo123456";

function getMongoUriForCheck() {
  return (
    process.env.MONGODB_URI?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.MONGO_URL?.trim() ||
    ""
  );
}

async function run() {
  const raw = getMongoUriForCheck();
  if (!raw) {
    console.error("MONGODB_URI is missing. Set it in .env.local (copy from .env.example).");
    process.exit(1);
  }
  if (
    (raw.includes("<") && raw.includes(">")) ||
    /YOUR_ATLAS_PASSWORD|YOUR_PASSWORD|REPLACE_ME|db_password/i.test(raw)
  ) {
    console.error(
      "MONGODB_URI still contains a placeholder. In .env.local, set a real Atlas connection string:\n" +
        "mongodb+srv://USER:PASSWORD@cluster....mongodb.net/smilesync?retryWrites=true&w=majority\n" +
        "(URL-encode PASSWORD if it contains special characters.)"
    );
    process.exit(1);
  }
  const hostHint = raw.startsWith("mongodb+srv") ? "(Atlas)" : raw.includes("127.0.0.1") ? "(localhost)" : "(custom)";
  console.log("Connecting to MongoDB", hostHint);
  await connectDb();
  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Staff.deleteMany({}),
    InventoryItem.deleteMany({}),
    Dentist.deleteMany({}),
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
    Treatment.deleteMany({}),
    Payment.deleteMany({}),
    Prescription.deleteMany({}),
    Report.deleteMany({}),
    Membership.deleteMany({}),
    Notification.deleteMany({}),
    NewsletterSubscriber.deleteMany({}),
    Consultation.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const [admin, dentistUser, patientUser] = await User.create([
    { name: "Admin User", email: "admin@smilesync.app", role: "admin", passwordHash },
    { name: "Dr. Rohan Kapoor", email: "dentist@smilesync.app", role: "dentist", passwordHash },
    { name: "Patient Demo", email: "patient@smilesync.app", role: "patient", passwordHash },
  ]);

  const [branchCentral, branchWest] = await Branch.create([
    { name: "SmileSync Central", code: "CTR", address: "221B Baker Street", phone: "+91-9000000001", active: true },
    { name: "SmileSync West", code: "WST", address: "9 Downtown Ave", phone: "+91-9000000002", active: true },
  ]);

  const dentist = await Dentist.create({
    userId: dentistUser._id,
    specialization: "Cosmetic",
    branch: "Central",
    availability: ["09:00", "09:30"],
  });
  const patient = await Patient.create({
    userId: patientUser._id,
    dob: new Date("1996-04-15"),
    medicalHistory: ["Mild sensitivity"],
    allergies: ["None"],
    emergencyContact: "Emergency +91-8000000000",
  });
  await Staff.create([
    { branchId: branchCentral._id, name: "Neha Verma", title: "Lead Hygienist", email: "neha@smilesync.app", phone: "+91-9100000001", active: true },
    { branchId: branchWest._id, name: "Arjun Mehta", title: "Reception", email: "arjun@smilesync.app", active: true },
  ]);
  await InventoryItem.create([
    { branchId: branchCentral._id, sku: "GLO-100", name: "Whitening gel kit", quantity: 24, unit: "kits", reorderLevel: 6 },
    { branchId: branchCentral._id, sku: "PPE-50", name: "Surgical masks", quantity: 4, unit: "boxes", reorderLevel: 10 },
    { branchId: branchWest._id, sku: "ALG-20", name: "Alginate powder", quantity: 18, unit: "bags", reorderLevel: 5 },
  ]);

  const appointment = await Appointment.create({
    patientId: String(patient._id),
    dentistId: String(dentist._id),
    date: "2026-05-12",
    time: "10:30",
    branch: "Central",
    status: "booked",
  });
  await Treatment.create({ patientId: patient._id, appointmentId: appointment._id, serviceSlug: "teeth-whitening", estimatedCost: 8000, actualCost: 7500, progress: 80 });
  await Payment.create({ userId: String(patientUser._id), amount: 199900, status: "paid", purpose: "membership" });
  await Prescription.create({ patientId: patient._id, dentistId: dentist._id, medications: [{ name: "Mouthwash", dosage: "2x", duration: "7 days" }], advice: "Avoid cold beverages for 48h." });
  await Report.create({ patientId: patient._id, type: "X-Ray", summary: "No severe issue.", aiSimplified: "Normal structural scan." });
  await Membership.create({ userId: patientUser._id, plan: "premium", startsAt: new Date(), endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), active: true });
  await Notification.create({ userId: String(patientUser._id), title: "Welcome to SmileSync", body: "Your premium plan is active." });

  console.log("Seed complete");
  console.log("Demo password for all seeded users:", DEMO_PASSWORD);
  console.log({
    admin: admin.email,
    dentist: dentistUser.email,
    patient: patientUser.email,
  });
  process.exit(0);
}

run().catch((error) => {
  console.error("Seed failed", error);
  if (String(error?.message ?? "").includes("ECONNREFUSED")) {
    console.error("\n→ MongoDB refused the connection. Either:");
    console.error("  1. Start MongoDB locally, or");
    console.error("  2. Put your Atlas URI in .env.local as MONGODB_URI (seed now loads .env.local automatically).\n");
  }
  process.exit(1);
});
