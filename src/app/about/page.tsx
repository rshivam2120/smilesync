import { GlassCard } from "@/components/ui-kit";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 md:px-8">
      <h1 className="text-4xl font-bold">About SmileSync</h1>
      <GlassCard>Clinic story, mission, and vision for premium digital-first dentistry.</GlassCard>
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>Awards & certifications wall</GlassCard>
        <GlassCard>Modern clinic gallery</GlassCard>
      </div>
      <GlassCard>Timeline of clinic growth from single-chair setup to multi-branch enterprise.</GlassCard>
    </div>
  );
}
