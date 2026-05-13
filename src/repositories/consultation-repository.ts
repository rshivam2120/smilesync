import { Consultation, Dentist, Patient, Prescription } from "@/models";
import mongoose from "mongoose";

export async function createConsultation(input: {
  patientId: string;
  dentistId: string;
}) {
  const patient = await Patient.findById(input.patientId);
  if (!patient) throw new Error("Patient profile not found.");

  const dentist = await Dentist.findById(input.dentistId);
  if (!dentist) throw new Error("Dentist not found.");

  const doc = await Consultation.create({
    patientId: new mongoose.Types.ObjectId(input.patientId),
    dentistId: new mongoose.Types.ObjectId(input.dentistId),
    status: "active",
    notes: "",
    chat: [],
  });

  return doc;
}

export async function appendChat(input: { consultationId: string; role: "patient" | "assistant"; text: string }) {
  return Consultation.findByIdAndUpdate(
    input.consultationId,
    {
      $push: {
        chat: {
          role: input.role,
          text: input.text,
        },
      },
    },
    { new: true }
  ).exec();
}

export async function updateNotes(input: { consultationId: string; notes: string }) {
  return Consultation.findByIdAndUpdate(
    input.consultationId,
    { $set: { notes: input.notes } },
    { new: true }
  ).exec();
}

export async function getConsultation(input: { consultationId: string }) {
  return Consultation.findById(input.consultationId).lean();
}

export async function generateAndPersistPrescription(input: {
  consultationId: string;
  draft: { medications: { name: string; dosage: string; duration: string }[]; advice: string };
}) {
  const consultation = await Consultation.findById(input.consultationId);
  if (!consultation) throw new Error("Consultation not found.");

  const prescription = await Prescription.create({
    patientId: consultation.patientId,
    dentistId: consultation.dentistId,
    medications: input.draft.medications,
    advice: input.draft.advice,
  });

  consultation.prescriptionDraft = input.draft;
  await consultation.save();

  return { consultation: consultation.toObject(), prescription };
}

