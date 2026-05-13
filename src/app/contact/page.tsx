import { GlassCard, PrimaryButton } from "@/components/ui-kit";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 md:px-8">
      <h1 className="text-4xl font-bold">Contact SmileSync Clinics</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>Google Maps integration section</GlassCard>
        <GlassCard>
          <h2 className="font-semibold">Contact Form</h2>
          <div className="mt-3 space-y-2">
            <input placeholder="Name" className="w-full rounded-xl border border-slate-300/40 bg-transparent px-3 py-2 dark:border-slate-700" />
            <input placeholder="Email" className="w-full rounded-xl border border-slate-300/40 bg-transparent px-3 py-2 dark:border-slate-700" />
            <textarea placeholder="Message" className="w-full rounded-xl border border-slate-300/40 bg-transparent px-3 py-2 dark:border-slate-700" />
          </div>
          <PrimaryButton className="mt-3">Send Message</PrimaryButton>
        </GlassCard>
      </div>
      <GlassCard>Clinic timings, emergency contact, WhatsApp floating CTA, and social media links.</GlassCard>
    </div>
  );
}
