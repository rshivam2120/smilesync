"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BeforeAfterSlider, HeroVisual3D, LandingFaqAccordion, StatCounters, TestimonialsCarousel } from "@/components/landing/landing-blocks";
import { dentists, dashboardStats, membershipPlans, services } from "@/lib/data";
import { GlassCard, OutlineButton, PrimaryButton } from "./ui-kit";

export function LandingPageContent() {
  return (
    <div className="space-y-16">
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-10 md:grid-cols-2 md:px-8">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold leading-tight md:text-6xl">
            Transform Your Smile With Advanced Dental Care
          </motion.h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Enterprise-grade dental care platform blending premium treatment, AI diagnostics, and seamless scheduling.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryButton href="/appointments">Book Appointment</PrimaryButton>
            <OutlineButton href="/ai-smile-analysis">AI Smile Scan</OutlineButton>
          </div>
        </div>
        <HeroVisual3D />
      </section>

      <StatCounters />

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-3xl font-semibold">Services</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {services.map((svc) => (
            <Link key={svc.slug} href={`/services/${svc.slug}`}>
              <GlassCard className="h-full transition hover:border-cyan-400/40">
                <h3 className="font-semibold">{svc.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-500">{svc.description}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-3 md:px-8">
        <div className="md:col-span-2">
          <BeforeAfterSlider />
        </div>
        <TestimonialsCarousel />
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-3xl font-semibold">Expert Dentists</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {dentists.map((d) => (
            <GlassCard key={d.name}>
              <h3 className="font-semibold">{d.name}</h3>
              <p className="text-sm text-slate-500">{d.role}</p>
              <p className="text-sm text-slate-500">{d.experience}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-3xl font-semibold">Membership Pricing + EMI</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {membershipPlans.map((p) => (
            <GlassCard key={p.id}>
              <h3 className="font-semibold">{p.name}</h3>
              <p className="my-2 text-2xl font-bold">{p.price}</p>
              <ul className="space-y-1 text-sm text-slate-500">
                {p.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
              <PrimaryButton href="/membership" className="mt-4 w-full">
                Choose Plan
              </PrimaryButton>
            </GlassCard>
          ))}
        </div>
      </section>

      <LandingFaqAccordion />

      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <GlassCard>
          <h3 className="text-xl font-semibold">Emergency Dental Support</h3>
          <p className="mt-2 text-sm text-slate-500">Rapid triage in under 10 minutes with emergency doctor routing and AI symptom prioritization.</p>
        </GlassCard>
      </section>
    </div>
  );
}

const revData = [{ month: "Jan", value: 8 }, { month: "Feb", value: 11 }, { month: "Mar", value: 14 }, { month: "Apr", value: 16 }, { month: "May", value: 18 }];
const apptData = [{ day: "Mon", value: 80 }, { day: "Tue", value: 95 }, { day: "Wed", value: 121 }, { day: "Thu", value: 102 }, { day: "Fri", value: 140 }];

export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {dashboardStats.map((s) => (
          <GlassCard key={s.label}>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-emerald-500">{s.delta}</p>
          </GlassCard>
        ))}
      </div>
      <div className="grid min-h-88 gap-4 md:grid-cols-2 md:grid-rows-[22rem]">
        <GlassCard className="flex min-h-80 flex-col">
          <p className="text-sm font-semibold">Monthly Revenue</p>
          <div className="min-h-0 min-w-0 flex-1 pt-2">
            <ResponsiveContainer width="100%" height="100%" minHeight={260}>
              <BarChart data={revData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#06b6d4" radius={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="flex min-h-80 flex-col">
          <p className="text-sm font-semibold">Appointment Trends</p>
          <div className="min-h-0 min-w-0 flex-1 pt-2">
            <ResponsiveContainer width="100%" height="100%" minHeight={260}>
              <LineChart data={apptData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export function AppointmentScheduler() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <GlassCard className="md:col-span-2">
        <h2 className="text-xl font-semibold">Premium Booking Calendar</h2>
        <p className="mt-2 text-sm text-slate-500">Live availability, reschedule/cancel actions, reminders, and instant confirmations.</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          {["09:00", "10:00", "11:00", "12:30", "14:00", "17:00"].map((s) => (
            <button key={s} type="button" className="rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
              {s}
            </button>
          ))}
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="font-semibold">Select Dentist</h3>
        <div className="mt-3 space-y-2">
          {dentists.map((d) => (
            <button key={d.name} type="button" className="w-full rounded-xl bg-slate-100 p-2 text-left text-sm dark:bg-slate-800">
              {d.name}
            </button>
          ))}
        </div>
        <PrimaryButton className="mt-4 w-full">Confirm Appointment</PrimaryButton>
      </GlassCard>
    </div>
  );
}
