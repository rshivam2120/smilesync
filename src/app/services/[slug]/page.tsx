import { notFound } from "next/navigation";
import { services } from "@/lib/data";
import { GlassCard, PrimaryButton } from "@/components/ui-kit";

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-8">
      <GlassCard>
        <h1 className="text-4xl font-bold">{service.name}</h1>
        <p className="mt-3 text-slate-500">{service.description}</p>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard><h2 className="font-semibold">Benefits</h2><ul className="mt-2 space-y-2 text-sm">{service.benefits.map((b) => <li key={b}>• {b}</li>)}</ul></GlassCard>
        <GlassCard><h2 className="font-semibold">Estimated Pricing</h2><p className="mt-2 text-2xl font-bold">{service.price}</p></GlassCard>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>Before/After image comparison module</GlassCard>
        <GlassCard><h2 className="font-semibold">FAQs</h2><div className="mt-2 space-y-2 text-sm">{service.faqs.map((faq) => <p key={faq.q}><b>{faq.q}</b> {faq.a}</p>)}</div></GlassCard>
      </div>
      <PrimaryButton className="w-full">Book Consultation</PrimaryButton>
    </div>
  );
}
