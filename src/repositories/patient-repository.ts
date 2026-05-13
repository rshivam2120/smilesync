import mongoose from "mongoose";
import { Patient, User } from "@/models";

export async function findPatientByUserId(userId: string) {
  return Patient.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    deletedAt: { $exists: false },
  }).exec();
}

export async function findPatientById(id: string) {
  return Patient.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
}

export async function listPatientsWithUsers(limit = 200) {
  return Patient.find({ deletedAt: { $exists: false } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "name email phone role")
    .lean();
}

export async function updatePatientProfile(
  patientId: string,
  data: {
    dob?: Date;
    medicalHistory?: string[];
    allergies?: string[];
    emergencyContact?: string;
  }
) {
  return Patient.findByIdAndUpdate(patientId, { $set: data }, { new: true }).exec();
}

export async function updateUserBasics(
  userId: string,
  data: { name?: string; email?: string; phone?: string }
) {
  return User.findByIdAndUpdate(userId, { $set: data }, { new: true }).exec();
}

export async function softDeletePatient(patientId: string) {
  const patient = await Patient.findByIdAndUpdate(
    patientId,
    { $set: { deletedAt: new Date() } },
    { new: true }
  ).exec();
  if (patient?.userId) {
    await User.findByIdAndUpdate(patient.userId, { $set: { deletedAt: new Date() } }).exec();
  }
  return patient;
}
