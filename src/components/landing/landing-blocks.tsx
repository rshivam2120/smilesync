"use client";

import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui-kit";

/** Premium animated hero visual — stylized oral care orb */
export function HeroVisual3D() {
  return (
    <GlassCard className="relative flex min-h-72 items-center justify-center overflow-hidden bg-linear-to-br from-cyan-100/40 via-white/30 to-indigo-100/30 dark:from-teal-900/40 dark:via-slate-900/60 dark:to-cyan-950/40">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.35),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.25),transparent_45%)]"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full border border-cyan-400/40 dark:border-teal-500/30"
          style={{ width: 120 + i * 52, height: 120 + i * 52 }}
          animate={{ rotate: [0, 360], scale: [1, 1.03 + i * 0.02, 1] }}
          transition={{ duration: 22 + i * 6, repeat: Infinity, ease: "linear" }}
        />
      ))}
      <motion.div className="relative z-10 flex flex-col items-center gap-4 text-cyan-700 dark:text-cyan-300" animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        <div className="rounded-full bg-white/70 p-6 shadow-xl backdrop-blur-md dark:bg-slate-950/70">
          <Smile className="size-20 stroke-[1.25]" aria-hidden />
        </div>
        <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-300">Digital smile profiling · AI-guided care</p>
      </motion.div>
    </GlassCard>
  );
}

function AnimatedNumber({ target, decimals = 0 }: { target: number; decimals?: number }) {
  const ref = useRef(0);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 28, stiffness: 120 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    mv.set(0);
    const id = setTimeout(() => mv.set(target), 100);
    return () => clearTimeout(id);
  }, [mv, target]);

  useEffect(() => {
    return spring.on("change", (v) => {
      ref.current = v;
      setDisplay(v.toFixed(decimals));
    });
  }, [spring, decimals]);

  return <>{display}</>;
}

const STATS = [
  { label: "Patients cared for", numeric: 25, suffix: "k+", decimals: 0 },
  { label: "Satisfaction rate", numeric: 98, suffix: "%", decimals: 0 },
  { label: "Emergency response", numeric: 24, suffix: "/7", decimals: 0 },
  { label: "Clinical locations", numeric: 12, suffix: "+", decimals: 0 },
] as const;

export function StatCounters() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-4 md:px-8">
      {STATS.map((s, idx) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: idx * 0.08 }}
        >
          <GlassCard className="text-center">
            <p className="text-3xl font-bold tabular-nums text-cyan-600 dark:text-cyan-400 md:text-4xl">
              <AnimatedNumber target={s.numeric} decimals={s.decimals} />
              <span>{s.suffix}</span>
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{s.label}</p>
          </GlassCard>
        </motion.div>
      ))}
    </section>
  );
}

/** Compare slider: drag or use range input */
export function BeforeAfterSlider() {
  const [pos, setPos] = useState(50);
  return (
    <GlassCard className="relative overflow-hidden p-0">
      <div className="border-b border-white/10 px-6 pb-4 pt-6 dark:border-teal-500/10">
        <h3 className="text-lg font-semibold">Smile transformation</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Drag to compare clinical preview</p>
      </div>
      <div className="relative aspect-16/10 select-none md:aspect-21/9">
        {/* After (full width background) */}
        <div className="absolute inset-0 bg-linear-to-br from-cyan-200/90 to-teal-100/80 dark:from-teal-900/70 dark:to-cyan-950/90" aria-hidden />
        <div className="absolute inset-0 flex items-center justify-center text-slate-800 dark:text-teal-100">
          <span className="rounded-full bg-white/40 px-4 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur dark:bg-black/30">After</span>
        </div>
        {/* Before (clipped left) */}
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <div className="absolute inset-0 bg-linear-to-br from-slate-400/95 to-slate-500/80 dark:from-slate-700 dark:to-slate-900" aria-hidden />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <span className="rounded-full bg-black/25 px-4 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">Before</span>
          </div>
        </div>
        {/* Divider + knob */}
        <div className="pointer-events-none absolute bottom-0 top-0 z-10 w-0.5 bg-white shadow-[0_0_12px_rgba(6,182,212,0.8)]" style={{ left: `${pos}%`, transform: "translateX(-50%)" }} aria-hidden />
        <div
          className="pointer-events-none absolute bottom-6 z-20 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-cyan-500 bg-white text-xs font-bold text-cyan-600 shadow-xl dark:bg-slate-900 dark:text-cyan-400"
          style={{ left: `${pos}%` }}
          aria-hidden
        >
          ⇆
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute inset-x-0 bottom-3 z-30 mx-auto w-[92%] cursor-ew-resize opacity-70 accent-cyan-500 hover:opacity-100 md:opacity-90"
          aria-label="Adjust before and after reveal"
        />
      </div>
    </GlassCard>
  );
}

const TESTIMONIALS = [
  { name: "Meera Kapoor", quote: "The AI scan explained everything in plain language. Booking took under a minute.", role: "Member since 2024" },
  { name: "Arjun Malik", quote: "Premium feel from day one — aligned with SmileSync branding and real clinical depth.", role: "Business executive" },
  { name: "Dr. Kavita Bose", quote: "As a referrer, dashboards and appointment flow feel enterprise-ready.", role: "Partner clinician" },
];

export function TestimonialsCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % TESTIMONIALS.length), 6200);
    return () => clearInterval(t);
  }, []);
  const t = TESTIMONIALS[i];

  return (
    <GlassCard className="flex flex-col overflow-hidden">
      <h3 className="text-lg font-semibold">What patients say</h3>
      <div className="relative mt-4 min-h-[120px]">
        <AnimatePresence mode="wait">
          <motion.blockquote key={t.name} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="text-sm text-slate-600 dark:text-slate-300">
            “{t.quote}”
            <footer className="mt-3 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
              {t.name} · <span className="font-normal text-slate-500">{t.role}</span>
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>
      <div className="mt-auto flex items-center justify-between pt-6">
        <button type="button" className="rounded-full border border-slate-300/50 p-2 dark:border-slate-600" aria-label="Previous testimonial" onClick={() => setI((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}>
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex gap-1.5">
          {TESTIMONIALS.map((_, idx) => (
            <button key={idx} type="button" className={cn("size-2 rounded-full transition", idx === i ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-600")} aria-label={`Go to testimonial ${idx + 1}`} onClick={() => setI(idx)} />
          ))}
        </div>
        <button type="button" className="rounded-full border border-slate-300/50 p-2 dark:border-slate-600" aria-label="Next testimonial" onClick={() => setI((p) => (p + 1) % TESTIMONIALS.length)}>
          <ChevronRight className="size-4" />
        </button>
      </div>
    </GlassCard>
  );
}

const FAQ_ITEMS = [
  { q: "How do I book an appointment?", a: "Use Book Appointment for live slots, or walk through Consultation if you prefer a virtual first step." },
  { q: "Is the AI Smile Scan a diagnosis?", a: "It is educational guidance based on visuals and inputs—not a substitute for an in-chair exam." },
  { q: "Do you offer EMI on treatments?", a: "Yes. Membership plans and treatment deposits can bundle with EMI partners—see Pricing + EMI." },
  { q: "What happens in an emergency?", a: "Our emergency banner routes priority cases—we recommend calling the hotline listed in Contact." },
];

export function LandingFaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mx-auto max-w-7xl px-4 md:px-8">
      <h2 className="mb-6 text-3xl font-semibold">Frequently asked</h2>
      <GlassCard className="divide-y divide-slate-200/50 p-0 dark:divide-slate-700/50">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <div key={item.q}>
              <button type="button" className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold hover:bg-white/40 dark:hover:bg-slate-800/40" onClick={() => setOpen(isOpen ? null : idx)} aria-expanded={isOpen}>
                {item.q}
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                  <ChevronDown className="size-4 shrink-0 text-cyan-600" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden px-6">
                    <p className="pb-4 text-sm text-slate-600 dark:text-slate-400">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </GlassCard>
    </motion.section>
  );
}
