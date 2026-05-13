import { respondToSymptom } from "./ai-service";

export function buildPrescriptionDraft(notes: string) {
  const normalized = notes.toLowerCase();

  const meds = [];

  if (normalized.includes("pain") || normalized.includes("ache") || normalized.includes("sensitivity")) {
    meds.push({ name: "Pain relief (educational guidance)", dosage: "As directed by clinician", duration: "3-5 days" });
  }

  if (normalized.includes("infection") || normalized.includes("swelling") || normalized.includes("pus")) {
    meds.push({ name: "Anti-infective discussion", dosage: "Clinician to prescribe if needed", duration: "As required" });
  }

  if (normalized.includes("bleeding") || normalized.includes("gum")) {
    meds.push({ name: "Gum care regimen", dosage: "Mouth rinse as advised", duration: "7-14 days" });
  }

  if (meds.length === 0) {
    meds.push({ name: "Supportive oral care", dosage: "Maintain hygiene + follow-up", duration: "5-7 days" });
  }

  const advice = respondToSymptom(notes) + " Please have a dentist confirm the final prescription after an in-person exam.";

  return { medications: meds, advice };
}

