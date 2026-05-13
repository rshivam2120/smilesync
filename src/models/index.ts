import mongoose, { Schema } from "mongoose";

const BaseOptions = { timestamps: true };

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, index: true },
    phone: String,
    role: { type: String, enum: ["admin", "dentist", "patient"], default: "patient", index: true },
    firebaseUid: { type: String, index: true, sparse: true },
    passwordHash: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    deletedAt: Date,
  },
  BaseOptions
);
const DentistSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, specialization: String, branch: String, availability: [String], rating: Number, deletedAt: Date }, BaseOptions);
const PatientSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true }, dob: Date, medicalHistory: [String], allergies: [String], emergencyContact: String, deletedAt: Date }, BaseOptions);
const AppointmentSchema = new Schema({ patientId: { type: String, required: true, index: true }, dentistId: { type: String, required: true, index: true }, date: { type: String, required: true, index: true }, time: { type: String, required: true }, status: { type: String, enum: ["booked", "cancelled", "completed"], default: "booked" }, notes: String, branch: String, deletedAt: Date }, BaseOptions);
const TreatmentSchema = new Schema({ patientId: { type: Schema.Types.ObjectId, ref: "Patient" }, appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" }, serviceSlug: String, estimatedCost: Number, actualCost: Number, progress: Number, deletedAt: Date }, BaseOptions);
const PaymentSchema = new Schema({ userId: { type: String, required: true, index: true }, razorpayOrderId: { type: String, index: true }, amount: Number, currency: { type: String, default: "INR" }, status: { type: String, enum: ["created", "paid", "failed"], default: "created", index: true }, purpose: String, deletedAt: Date }, BaseOptions);
const PrescriptionSchema = new Schema({ patientId: { type: Schema.Types.ObjectId, ref: "Patient" }, dentistId: { type: Schema.Types.ObjectId, ref: "Dentist" }, medications: [{ name: String, dosage: String, duration: String }], advice: String, deletedAt: Date }, BaseOptions);
const ReportSchema = new Schema({ patientId: { type: Schema.Types.ObjectId, ref: "Patient" }, type: String, summary: String, fileUrl: String, aiSimplified: String, deletedAt: Date }, BaseOptions);
const MembershipSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: "User" }, plan: String, startsAt: Date, endsAt: Date, active: Boolean, deletedAt: Date }, BaseOptions);
const NotificationSchema = new Schema({ userId: { type: String, required: true, index: true }, title: String, body: String, read: { type: Boolean, default: false }, deletedAt: Date }, BaseOptions);
const NewsletterSubscriberSchema = new Schema(
  { email: { type: String, required: true, unique: true, lowercase: true, index: true }, source: String, subscribedAt: { type: Date, default: Date.now } },
  BaseOptions
);

const BranchSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    address: String,
    phone: String,
    active: { type: Boolean, default: true },
    deletedAt: Date,
  },
  BaseOptions
);

const StaffSchema = new Schema(
  {
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
    name: { type: String, required: true },
    email: String,
    phone: String,
    title: { type: String, required: true },
    active: { type: Boolean, default: true },
    deletedAt: Date,
  },
  BaseOptions
);

const InventoryItemSchema = new Schema(
  {
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
    sku: { type: String, required: true, index: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: "unit" },
    reorderLevel: { type: Number, default: 5 },
    deletedAt: Date,
  },
  BaseOptions
);

const ConsultationSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    dentistId: { type: Schema.Types.ObjectId, ref: "Dentist", required: true, index: true },
    status: { type: String, enum: ["active", "completed"], default: "active", index: true },
    notes: { type: String, default: "" },
    // Chat is kept lightweight for demo; production should normalize or store externally.
    chat: [
      {
        role: { type: String, enum: ["patient", "assistant"], required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    prescriptionDraft: {
      medications: [{ name: String, dosage: String, duration: String }],
      advice: String,
    },
    deletedAt: Date,
  },
  BaseOptions
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Branch = mongoose.models.Branch || mongoose.model("Branch", BranchSchema);
export const Staff = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
export const InventoryItem = mongoose.models.InventoryItem || mongoose.model("InventoryItem", InventoryItemSchema);
export const Dentist = mongoose.models.Dentist || mongoose.model("Dentist", DentistSchema);
export const Patient = mongoose.models.Patient || mongoose.model("Patient", PatientSchema);
export const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
export const Treatment = mongoose.models.Treatment || mongoose.model("Treatment", TreatmentSchema);
export const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
export const Prescription = mongoose.models.Prescription || mongoose.model("Prescription", PrescriptionSchema);
export const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);
export const Membership = mongoose.models.Membership || mongoose.model("Membership", MembershipSchema);
export const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
export const NewsletterSubscriber =
  mongoose.models.NewsletterSubscriber || mongoose.model("NewsletterSubscriber", NewsletterSubscriberSchema);

export const Consultation =
  mongoose.models.Consultation || mongoose.model("Consultation", ConsultationSchema);
