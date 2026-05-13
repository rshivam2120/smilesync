export type Service = {
  slug: string;
  name: string;
  description: string;
  benefits: string[];
  price: string;
  faqs: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "teeth-whitening",
    name: "Teeth Whitening",
    description: "Laser-assisted whitening for a brighter, stain-free smile in under 60 minutes.",
    benefits: ["Instant tone lift", "Safe enamel protocol", "Long-lasting brightness"],
    price: "INR 6,500 - 18,000",
    faqs: [
      { q: "Is the treatment safe?", a: "Yes, all whitening agents are clinically tested." },
      { q: "How long does it last?", a: "Typically 8-18 months with proper oral care." },
    ],
  },
  {
    slug: "root-canal",
    name: "Root Canal",
    description: "Pain-free endodontic treatment with digital imaging and precision tools.",
    benefits: ["Tooth preservation", "Pain relief", "Faster recovery"],
    price: "INR 4,000 - 14,000",
    faqs: [
      { q: "How many sittings are needed?", a: "Most cases complete in 1-2 visits." },
      { q: "Do I need a crown later?", a: "Usually yes, for long-term structural support." },
    ],
  },
  {
    slug: "dental-implants",
    name: "Dental Implants",
    description: "Premium titanium implants with guided surgery and digital smile planning.",
    benefits: ["Natural feel", "Jawbone support", "High durability"],
    price: "INR 28,000 - 90,000",
    faqs: [
      { q: "How long is implant recovery?", a: "Average healing period is 8-12 weeks." },
      { q: "Is it permanent?", a: "With oral hygiene and follow-ups, implants can last decades." },
    ],
  },
  {
    slug: "braces",
    name: "Braces",
    description: "Advanced braces and hybrid orthodontics for predictable alignment.",
    benefits: ["Correct bite issues", "Improved smile aesthetics", "Progress tracking"],
    price: "INR 30,000 - 85,000",
    faqs: [
      { q: "How long is treatment?", a: "Most plans range from 12-24 months." },
      { q: "Are there invisible options?", a: "Yes, clear ceramic and aligner systems are available." },
    ],
  },
  {
    slug: "smile-designing",
    name: "Smile Designing",
    description: "AI-assisted smile design with veneers, contouring, and full digital previews.",
    benefits: ["Custom facial harmony", "Digital simulation", "Luxury smile finish"],
    price: "INR 45,000 - 2,20,000",
    faqs: [
      { q: "Can I preview the result?", a: "Yes, SmileSync includes digital preview before treatment." },
      { q: "How long does makeover take?", a: "Usually 2-6 weeks depending on case scope." },
    ],
  },
  {
    slug: "pediatric-dentistry",
    name: "Pediatric Dentistry",
    description: "Child-focused preventive and restorative care with anxiety-safe protocols.",
    benefits: ["Early cavity prevention", "Behavior-friendly approach", "Parental guidance"],
    price: "INR 1,200 - 12,000",
    faqs: [
      { q: "When should first visit happen?", a: "Recommended by age one or first tooth eruption." },
      { q: "Is sedation available?", a: "Yes, in selected cases under specialist supervision." },
    ],
  },
  {
    slug: "cosmetic-dentistry",
    name: "Cosmetic Dentistry",
    description: "Aesthetic corrections including bonding, veneers, contouring, and smile sculpting.",
    benefits: ["Natural aesthetics", "Minimal invasive options", "Confidence boost"],
    price: "INR 10,000 - 1,80,000",
    faqs: [
      { q: "Are veneers reversible?", a: "Conservative prep options may be reversible in some cases." },
      { q: "How durable are cosmetic treatments?", a: "Most last 5-15 years based on material and care." },
    ],
  },
  {
    slug: "invisible-aligners",
    name: "Invisible Aligners",
    description: "Clear aligner workflows powered by 3D scans and remote compliance tracking.",
    benefits: ["Near-invisible", "Removable comfort", "AI progress reminders"],
    price: "INR 65,000 - 2,10,000",
    faqs: [
      { q: "How many hours to wear?", a: "20-22 hours daily for best results." },
      { q: "How often are trays changed?", a: "Usually every 7-14 days." },
    ],
  },
];

export const dentists = [
  { name: "Dr. Aanya Mehra", role: "Chief Prosthodontist", experience: "12 years" },
  { name: "Dr. Rohan Kapoor", role: "Endodontic Specialist", experience: "10 years" },
  { name: "Dr. Sana Iqbal", role: "Cosmetic Dentist", experience: "8 years" },
];

export const membershipPlans = [
  { id: "basic", name: "Basic", price: "INR 1,999/mo", perks: ["2 Consultations", "10% Treatment Discount"] },
  { id: "premium", name: "Premium", price: "INR 4,999/mo", perks: ["Unlimited Consultations", "Priority Booking", "20% Discount"] },
  { id: "family", name: "Family", price: "INR 8,499/mo", perks: ["4 Members Covered", "Emergency Support", "25% Discount"] },
];

export const dashboardStats = [
  { label: "Monthly Revenue", value: "INR 24.8L", delta: "+18%" },
  { label: "New Patients", value: "1,248", delta: "+9%" },
  { label: "Appointments", value: "3,902", delta: "+14%" },
  { label: "Retention", value: "87%", delta: "+5%" },
];
