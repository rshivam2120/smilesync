export function buildSmileAnalysis(age: number, concern: string) {
  const seed = age + concern.length;
  const alignment = 60 + (seed % 35);
  const whitening = 58 + ((seed * 3) % 38);
  const gumHealth = 65 + ((seed * 5) % 30);
  const symmetry = 62 + ((seed * 7) % 33);
  const confidence = Math.round((alignment + whitening + gumHealth + symmetry) / 4);

  return {
    alignment,
    whitening,
    gumHealth,
    symmetry,
    confidence,
    recommendations: [
      alignment < 78 ? "Clear aligners for bite correction" : "Retention and monitoring plan",
      whitening < 80 ? "Professional whitening cycle" : "Maintenance polishing every 6 months",
      gumHealth < 80 ? "Deep cleaning and gum-care therapy" : "Preventive hygiene follow-up",
    ],
  };
}

export function respondToSymptom(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("pain")) return "Persistent pain can indicate pulp inflammation. Book an urgent consultation and avoid very hot/cold foods.";
  if (normalized.includes("bleeding")) return "Bleeding gums often indicate gingival inflammation. Schedule scaling and improve flossing routine.";
  if (normalized.includes("braces")) return "For braces or aligners, we recommend a digital bite scan and orthodontic planning appointment.";
  return "Based on your message, start with an oral exam + digital scan. I can also help you book the earliest available slot.";
}
