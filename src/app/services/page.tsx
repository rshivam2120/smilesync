import Link from "next/link";
import { services } from "@/lib/data";
import { GlassCard } from "@/components/ui-kit";

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <h1 className="text-4xl font-bold">Premium Services</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {services.map((svc) => (
          <Link href={`/services/${svc.slug}`} key={svc.slug}>
            <GlassCard className="h-full">
              <h2 className="font-semibold">{svc.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{svc.description}</p>
              <p className="mt-4 text-xs font-semibold text-cyan-600">From {svc.price}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
