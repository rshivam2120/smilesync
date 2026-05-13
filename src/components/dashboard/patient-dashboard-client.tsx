"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { LogoutButton } from "@/components/auth/logout-button";
import { GlassCard, PrimaryButton, OutlineButton } from "@/components/ui-kit";

type DashboardPayload = {
  profile: {
    user: { id: string; name?: string; email?: string; phone?: string };
    patient: {
      id: string;
      dob?: string;
      medicalHistory?: string[];
      allergies?: string[];
      emergencyContact?: string;
    };
  };
  appointments: {
    upcoming: Array<{
      _id: string;
      date: string;
      time: string;
      status: string;
      branch?: string;
      notes?: string;
    }>;
    past: Array<{
      _id: string;
      date: string;
      time: string;
      status: string;
      branch?: string;
    }>;
  };
  treatments: Array<{
    _id: string;
    serviceSlug?: string;
    progress?: number;
    estimatedCost?: number;
    actualCost?: number;
    createdAt?: string;
  }>;
  prescriptions: Array<{
    _id: string;
    medications?: Array<{ name?: string; dosage?: string; duration?: string }>;
    advice?: string;
    createdAt?: string;
  }>;
  reports: Array<{ _id: string; type?: string; summary?: string; aiSimplified?: string; createdAt?: string }>;
  invoices: Array<{
    id: string;
    label: string;
    amount: number;
    currency: string;
    status: string;
    purpose: string;
    createdAt?: string;
  }>;
  notifications: Array<{ _id: string; title?: string; body?: string; read?: boolean; createdAt?: string }>;
  membership: { plan?: string; active?: boolean; endsAt?: string } | null;
  smileProgress: number;
  aiRecommendations: string[];
  smileScores: {
    alignment: number;
    whitening: number;
    gumHealth: number;
    symmetry: number;
    confidence: number;
  };
};

function formatInrPaise(amount: number) {
  return `₹${(amount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PatientDashboardClient() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    dob: "",
    medicalHistory: "",
    allergies: "",
    emergencyContact: "",
  });
  const [profileSaved, setProfileSaved] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/patient");
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load");
      setData(json.data);
      const p = json.data.profile;
      setProfileForm({
        name: p.user.name ?? "",
        phone: p.user.phone ?? "",
        dob: p.patient.dob ? format(new Date(p.patient.dob), "yyyy-MM-dd") : "",
        medicalHistory: (p.patient.medicalHistory ?? []).join(", "),
        allergies: (p.patient.allergies ?? []).join(", "),
        emergencyContact: p.patient.emergencyContact ?? "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaved(null);
    const res = await fetch("/api/dashboard/patient/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profileForm.name || undefined,
        phone: profileForm.phone || undefined,
        dob: profileForm.dob || undefined,
        medicalHistory: profileForm.medicalHistory
          ? profileForm.medicalHistory.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        allergies: profileForm.allergies
          ? profileForm.allergies.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        emergencyContact: profileForm.emergencyContact || undefined,
      }),
    });
    const json = await res.json();
    if (!json.ok) {
      setProfileSaved(json.error || "Save failed");
      return;
    }
    setProfileSaved("Profile updated.");
    await load();
  }

  async function cancelAppointment(id: string) {
    if (!confirm("Cancel this appointment?")) return;
    const res = await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "cancelled" }),
    });
    const json = await res.json();
    if (!json.ok) {
      alert(json.error || "Could not cancel");
      return;
    }
    await load();
  }

  async function markRead(id: string, read: boolean) {
    await fetch("/api/dashboard/patient/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
    await load();
  }

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <p className="text-slate-500">Loading your dashboard…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <GlassCard>{error || "Unable to load dashboard."}</GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Patient Dashboard</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Welcome back{data.profile.user.name ? `, ${data.profile.user.name}` : ""}.
            </p>
          </div>
          <LogoutButton className="shrink-0 self-start" />
        </div>
        {data.membership?.active && (
          <GlassCard className="max-w-md">
            <p className="text-xs uppercase tracking-wide text-cyan-600 dark:text-cyan-400">Membership</p>
            <p className="mt-1 font-semibold capitalize">{data.membership.plan ?? "Active plan"}</p>
            {data.membership.endsAt && (
              <p className="text-xs text-slate-500">Renews / ends {format(new Date(data.membership.endsAt), "PP")}</p>
            )}
          </GlassCard>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h2 className="text-lg font-semibold">Upcoming appointments</h2>
          <div className="mt-4 space-y-3">
            {data.appointments.upcoming.length === 0 && (
              <p className="text-sm text-slate-500">No upcoming visits. Book from the appointments page.</p>
            )}
            {data.appointments.upcoming.map((a) => (
              <div
                key={a._id}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {a.date} at {a.time}
                  </p>
                  <p className="text-xs text-slate-500">
                    {a.branch ?? "Clinic"} · {a.status}
                  </p>
                  {a.notes && <p className="mt-1 text-xs text-slate-400">{a.notes}</p>}
                </div>
                {a.status === "booked" && (
                  <OutlineButton type="button" className="text-red-400" onClick={() => void cancelAppointment(a._id)}>
                    Cancel
                  </OutlineButton>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold">Smile progress</h2>
          <p className="mt-2 text-4xl font-bold text-cyan-500">{data.smileProgress}%</p>
          <p className="mt-2 text-xs text-slate-500">Blended from active treatment plans.</p>
          <div className="mt-4 space-y-2 text-xs">
            {Object.entries(data.smileScores).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="capitalize text-slate-500">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg font-semibold">AI recommendations</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {data.aiRecommendations.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <div className="mt-3 space-y-2">
            {data.notifications.length === 0 && <p className="text-sm text-slate-500">No notifications.</p>}
            {data.notifications.map((n) => (
              <div
                key={n._id}
                className={`rounded-lg border border-white/10 p-2 text-sm ${n.read ? "opacity-60" : ""}`}
              >
                <p className="font-medium">{n.title}</p>
                <p className="text-xs text-slate-500">{n.body}</p>
                {!n.read && (
                  <button
                    type="button"
                    className="mt-1 text-xs text-cyan-500 hover:underline"
                    onClick={() => void markRead(n._id, true)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg font-semibold">Treatments</h2>
          <div className="mt-3 space-y-2 text-sm">
            {data.treatments.length === 0 && <p className="text-slate-500">No treatments on file.</p>}
            {data.treatments.map((t) => (
              <div key={t._id} className="rounded-lg bg-white/5 p-2">
                <p className="font-medium capitalize">{(t.serviceSlug ?? "Treatment").replace(/-/g, " ")}</p>
                <p className="text-xs text-slate-500">Progress {t.progress ?? 0}%</p>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold">Prescriptions</h2>
          <div className="mt-3 space-y-3 text-sm">
            {data.prescriptions.length === 0 && <p className="text-slate-500">No prescriptions yet.</p>}
            {data.prescriptions.map((p) => (
              <div key={p._id} className="rounded-lg bg-white/5 p-2">
                <ul className="list-inside list-disc text-xs">
                  {(p.medications ?? []).map((m, i) => (
                    <li key={i}>
                      {m.name} — {m.dosage} ({m.duration})
                    </li>
                  ))}
                </ul>
                {p.advice && <p className="mt-1 text-xs text-slate-400">{p.advice}</p>}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg font-semibold">Medical reports</h2>
          <div className="mt-3 space-y-2 text-sm">
            {data.reports.length === 0 && <p className="text-slate-500">No reports uploaded.</p>}
            {data.reports.map((r) => (
              <div key={r._id} className="rounded-lg bg-white/5 p-2">
                <p className="font-medium">{r.type}</p>
                <p className="text-xs text-slate-500">{r.summary}</p>
                {r.aiSimplified && <p className="mt-1 text-xs text-cyan-600 dark:text-cyan-400">AI: {r.aiSimplified}</p>}
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold">Invoices & payments</h2>
          <div className="mt-3 space-y-2 text-sm">
            {data.invoices.length === 0 && <p className="text-slate-500">No payments yet.</p>}
            {data.invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg bg-white/5 p-2">
                <div>
                  <p className="font-medium">{inv.label}</p>
                  <p className="text-xs capitalize text-slate-500">
                    {inv.purpose} · {inv.status}
                  </p>
                </div>
                <p className="font-semibold">{formatInrPaise(inv.amount)}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-lg font-semibold">Past appointments</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {data.appointments.past.length === 0 && <span className="text-slate-500">None</span>}
          {data.appointments.past.slice(0, 12).map((a) => (
            <span key={a._id} className="rounded-full bg-white/10 px-3 py-1">
              {a.date} {a.time} · {a.status}
            </span>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-semibold">Profile settings</h2>
        <form onSubmit={(e) => void saveProfile(e)} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Name
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={profileForm.name}
              onChange={(e) => setProfileForm((s) => ({ ...s, name: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            Phone
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={profileForm.phone}
              onChange={(e) => setProfileForm((s) => ({ ...s, phone: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            Date of birth
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={profileForm.dob}
              onChange={(e) => setProfileForm((s) => ({ ...s, dob: e.target.value }))}
            />
          </label>
          <label className="text-sm md:col-span-2">
            Emergency contact
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={profileForm.emergencyContact}
              onChange={(e) => setProfileForm((s) => ({ ...s, emergencyContact: e.target.value }))}
            />
          </label>
          <label className="text-sm md:col-span-2">
            Medical history (comma-separated)
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={profileForm.medicalHistory}
              onChange={(e) => setProfileForm((s) => ({ ...s, medicalHistory: e.target.value }))}
            />
          </label>
          <label className="text-sm md:col-span-2">
            Allergies (comma-separated)
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={profileForm.allergies}
              onChange={(e) => setProfileForm((s) => ({ ...s, allergies: e.target.value }))}
            />
          </label>
          {profileSaved && <p className="text-sm text-cyan-500 md:col-span-2">{profileSaved}</p>}
          <PrimaryButton type="submit" className="md:col-span-2">
            Save profile
          </PrimaryButton>
        </form>
      </GlassCard>
    </div>
  );
}
