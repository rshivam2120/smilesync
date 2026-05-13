import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(80),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const firebaseSessionSchema = z.object({
  idToken: z.string().min(100),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(16),
  password: z.string().min(8).max(128),
});

export const appointmentCreateSchema = z.object({
  /** Ignored for logged-in patients; server uses Patient profile linked to session */
  patientId: z.string().min(3).optional(),
  dentistId: z.string().min(3),
  date: z.string().min(10),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(500).optional(),
  branch: z.string().min(2),
});

export const appointmentUpdateSchema = z.object({
  id: z.string().min(3),
  status: z.enum(["booked", "cancelled", "completed"]).optional(),
  date: z.string().min(10).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const slotsSchema = z.object({
  dentistId: z.string().min(3),
  date: z.string().min(10),
});

export const paymentOrderSchema = z.object({
  amount: z.number().int().positive(),
  purpose: z.enum(["consultation", "membership", "deposit"]).default("membership"),
  referenceId: z.string().optional(),
  userId: z.string().min(3),
});

export const paymentVerifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export const aiChatSchema = z.object({
  message: z.string().min(2).max(500),
});

export const aiSmileSchema = z.object({
  age: z.number().min(5).max(100).default(25),
  concern: z.string().min(2).default("general"),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

export const consultationCreateSchema = z.object({
  dentistId: z.string().min(3),
});

export const consultationNotesSchema = z.object({
  notes: z.string().max(4000).default(""),
});

export const consultationChatSchema = z.object({
  message: z.string().min(2).max(2000),
});

export const consultationPrescriptionSchema = z.object({
  notes: z.string().max(4000).optional(),
});

export const patientProfileUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().max(32).optional(),
  dob: z.string().optional(),
  medicalHistory: z.array(z.string().max(200)).max(50).optional(),
  allergies: z.array(z.string().max(200)).max(50).optional(),
  emergencyContact: z.string().max(200).optional(),
});

export const notificationReadSchema = z.object({
  id: z.string().min(3),
  read: z.boolean(),
});

export const branchCreateSchema = z.object({
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(16).regex(/^[A-Z0-9_-]+$/i),
  address: z.string().max(500).optional(),
  phone: z.string().max(32).optional(),
  active: z.boolean().optional(),
});

export const branchUpdateSchema = branchCreateSchema.partial().extend({
  id: z.string().min(3),
});

export const staffCreateSchema = z.object({
  branchId: z.string().min(3),
  name: z.string().min(2).max(120),
  email: z.string().email().optional(),
  phone: z.string().max(32).optional(),
  title: z.string().min(2).max(80),
  active: z.boolean().optional(),
});

export const staffUpdateSchema = staffCreateSchema.partial().extend({
  id: z.string().min(3),
});

export const inventoryCreateSchema = z.object({
  branchId: z.string().min(3),
  sku: z.string().min(2).max(64),
  name: z.string().min(2).max(200),
  quantity: z.number().int().min(0),
  unit: z.string().max(32).optional(),
  reorderLevel: z.number().int().min(0).optional(),
});

export const inventoryUpdateSchema = inventoryCreateSchema.partial().extend({
  id: z.string().min(3),
});

export const adminPatientUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(32).optional(),
  dob: z.string().optional(),
  medicalHistory: z.array(z.string().max(200)).max(50).optional(),
  allergies: z.array(z.string().max(200)).max(50).optional(),
  emergencyContact: z.string().max(200).optional(),
});
