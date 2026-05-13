"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LogoutButton } from "@/components/auth/logout-button";
import { GlassCard, OutlineButton, PrimaryButton } from "@/components/ui-kit";

type Analytics = {
  kpis: {
    totalAppointments: number;
    booked: number;
    completed: number;
    cancelled: number;
    patients: number;
    treatments: number;
    staffActive: number;
    revenueInr: number;
  };
  charts: {
    revenueByMonth: { label: string; value: number }[];
    appointmentsByBranch: { name: string; count: number }[];
    appointmentsLast7Days: { day: string; value: number }[];
  };
  branches: Array<{ _id: string; name: string; code: string }>;
  lowStock: Array<{ _id: string; name: string; sku: string; quantity: number; branchId?: unknown }>;
  recentAppointments: Array<{ _id: string; date: string; time: string; status: string; branch?: string; patientId: string }>;
};

type Tab = "overview" | "appointments" | "patients" | "staff" | "inventory" | "branches";

export function AdminDashboardClient() {
  const [tab, setTab] = useState<Tab>("overview");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [appointments, setAppointments] = useState<Array<Record<string, unknown>>>([]);
  const [patients, setPatients] = useState<Array<Record<string, unknown>>>([]);
  const [staff, setStaff] = useState<Array<Record<string, unknown>>>([]);
  const [inventory, setInventory] = useState<Array<Record<string, unknown>>>([]);
  const [branches, setBranches] = useState<Array<Record<string, unknown>>>([]);
  const [err, setErr] = useState<string | null>(null);
  const [branchFilter, setBranchFilter] = useState("");

  const refreshAnalytics = useCallback(async () => {
    const res = await fetch("/api/admin/analytics");
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "analytics");
    setAnalytics(json.data);
  }, []);

  const refreshAppointments = useCallback(async () => {
    const res = await fetch("/api/appointments");
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "appointments");
    setAppointments(json.data.appointments ?? []);
  }, []);

  const refreshPatients = useCallback(async () => {
    const res = await fetch("/api/admin/patients");
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "patients");
    setPatients(json.data.patients ?? []);
  }, []);

  const refreshStaff = useCallback(async () => {
    const q = branchFilter ? `?branchId=${encodeURIComponent(branchFilter)}` : "";
    const res = await fetch(`/api/admin/staff${q}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "staff");
    setStaff(json.data.staff ?? []);
  }, [branchFilter]);

  const refreshInventory = useCallback(async () => {
    const q = branchFilter ? `?branchId=${encodeURIComponent(branchFilter)}` : "";
    const res = await fetch(`/api/admin/inventory${q}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "inventory");
    setInventory(json.data.items ?? []);
  }, [branchFilter]);

  const refreshBranches = useCallback(async () => {
    const res = await fetch("/api/admin/branches");
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "branches");
    setBranches(json.data.branches ?? []);
  }, []);

  useEffect(() => {
    setErr(null);
    void (async () => {
      try {
        await refreshAnalytics();
        await refreshAppointments();
        await refreshBranches();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Load failed");
      }
    })();
  }, [refreshAnalytics, refreshAppointments, refreshBranches]);

  useEffect(() => {
    if (tab === "patients") void refreshPatients().catch((e) => setErr(String(e)));
  }, [tab, refreshPatients]);

  useEffect(() => {
    if (tab === "staff") void refreshStaff().catch((e) => setErr(String(e)));
  }, [tab, refreshStaff, branchFilter]);

  useEffect(() => {
    if (tab === "inventory") void refreshInventory().catch((e) => setErr(String(e)));
  }, [tab, refreshInventory, branchFilter]);

  useEffect(() => {
    if (tab === "branches") void refreshBranches().catch((e) => setErr(String(e)));
  }, [tab, refreshBranches]);

  async function patchAppointment(id: string, status: string) {
    const res = await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const json = await res.json();
    if (!json.ok) {
      alert(json.error);
      return;
    }
    await refreshAppointments();
    await refreshAnalytics();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 md:px-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-4xl font-bold">Dentist / Admin Dashboard</h1>
          <LogoutButton className="shrink-0 self-start sm:self-auto" />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["overview", "Overview"],
              ["appointments", "Appointments"],
              ["patients", "Patients"],
              ["staff", "Staff"],
              ["inventory", "Inventory"],
              ["branches", "Branches"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === k
                  ? "bg-cyan-500 text-white"
                  : "border border-white/20 bg-white/5 text-slate-600 dark:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {err && <GlassCard className="border-red-500/40 text-red-600">{err}</GlassCard>}

      {tab === "overview" && analytics && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <GlassCard>
              <p className="text-xs text-slate-500">Appointments</p>
              <p className="mt-2 text-2xl font-semibold">{analytics.kpis.totalAppointments}</p>
              <p className="text-xs text-slate-400">
                Booked {analytics.kpis.booked} · Done {analytics.kpis.completed} · Cancelled {analytics.kpis.cancelled}
              </p>
            </GlassCard>
            <GlassCard>
              <p className="text-xs text-slate-500">Patients</p>
              <p className="mt-2 text-2xl font-semibold">{analytics.kpis.patients}</p>
              <p className="text-xs text-slate-400">Active profiles in CRM</p>
            </GlassCard>
            <GlassCard>
              <p className="text-xs text-slate-500">Revenue (INR)</p>
              <p className="mt-2 text-2xl font-semibold">{analytics.kpis.revenueInr}</p>
              <p className="text-xs text-slate-400">Paid Razorpay orders (paise → INR)</p>
            </GlassCard>
            <GlassCard>
              <p className="text-xs text-slate-500">Active staff</p>
              <p className="mt-2 text-2xl font-semibold">{analytics.kpis.staffActive}</p>
              <p className="text-xs text-slate-400">Treatments logged: {analytics.kpis.treatments}</p>
            </GlassCard>
          </div>
          <div className="grid min-h-88 gap-4 md:grid-cols-2 md:grid-rows-[22rem]">
            <GlassCard className="flex min-h-80 flex-col">
              <p className="text-sm font-semibold">Revenue by month (INR)</p>
              <div className="min-h-0 min-w-0 flex-1 pt-2">
                <ResponsiveContainer width="100%" height="100%" minHeight={260}>
                  <BarChart data={analytics.charts.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#06b6d4" radius={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
            <GlassCard className="flex min-h-80 flex-col">
              <p className="text-sm font-semibold">Appointments (last 7 days)</p>
              <div className="min-h-0 min-w-0 flex-1 pt-2">
                <ResponsiveContainer width="100%" height="100%" minHeight={260}>
                  <LineChart data={analytics.charts.appointmentsLast7Days}>
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
          <GlassCard>
            <p className="text-sm font-semibold">This month by branch</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {analytics.charts.appointmentsByBranch.map((b) => (
                <span key={b.name} className="rounded-full bg-white/10 px-3 py-1">
                  {b.name}: {b.count}
                </span>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <p className="text-sm font-semibold">Low stock</p>
            <ul className="mt-2 list-inside list-disc text-sm text-slate-600 dark:text-slate-300">
              {analytics.lowStock.length === 0 && <li>All SKUs above reorder level.</li>}
              {analytics.lowStock.map((i) => (
                <li key={String(i._id)}>
                  {i.name} ({i.sku}) — qty {i.quantity}
                </li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard>
            <p className="text-sm font-semibold">Recent appointments</p>
            <div className="mt-2 space-y-1 text-xs">
              {analytics.recentAppointments.map((a) => (
                <div key={String(a._id)} className="flex justify-between gap-2 border-b border-white/5 py-1">
                  <span>
                    {a.date} {a.time} · {a.branch}
                  </span>
                  <span className="capitalize text-slate-500">{a.status}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "appointments" && (
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">All appointments</h2>
            <OutlineButton type="button" onClick={() => void refreshAppointments()}>
              Refresh
            </OutlineButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-slate-500">
                  <th className="py-2">Date</th>
                  <th className="py-2">Time</th>
                  <th className="py-2">Branch</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={String(a._id)} className="border-b border-white/5">
                    <td className="py-2">{String(a.date)}</td>
                    <td className="py-2">{String(a.time)}</td>
                    <td className="py-2">{String(a.branch ?? "")}</td>
                    <td className="py-2 capitalize">{String(a.status)}</td>
                    <td className="py-2 space-x-2">
                      {a.status === "booked" && (
                        <>
                          <button
                            type="button"
                            className="text-cyan-500 hover:underline"
                            onClick={() => void patchAppointment(String(a._id), "completed")}
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            className="text-amber-500 hover:underline"
                            onClick={() => void patchAppointment(String(a._id), "cancelled")}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {tab === "patients" && <PatientsPanel patients={patients} onRefresh={() => void refreshPatients()} />}

      {tab === "staff" && (
        <StaffPanel
          staff={staff}
          branches={branches}
          branchFilter={branchFilter}
          setBranchFilter={setBranchFilter}
          onRefresh={() => void refreshStaff()}
        />
      )}

      {tab === "inventory" && (
        <InventoryPanel
          items={inventory}
          branches={branches}
          branchFilter={branchFilter}
          setBranchFilter={setBranchFilter}
          onRefresh={() => void refreshInventory()}
        />
      )}

      {tab === "branches" && <BranchesPanel branches={branches} onRefresh={() => void refreshBranches()} />}
    </div>
  );
}

function PatientsPanel({
  patients,
  onRefresh,
}: {
  patients: Array<Record<string, unknown>>;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    medicalHistory: "",
    allergies: "",
    emergencyContact: "",
  });

  function startEdit(p: Record<string, unknown>) {
    setEditing(p);
    const u = p.userId as Record<string, unknown> | undefined;
    setForm({
      name: String(u?.name ?? ""),
      email: String(u?.email ?? ""),
      phone: String(u?.phone ?? ""),
      dob: p.dob ? String(p.dob).slice(0, 10) : "",
      medicalHistory: Array.isArray(p.medicalHistory) ? (p.medicalHistory as string[]).join(", ") : "",
      allergies: Array.isArray(p.allergies) ? (p.allergies as string[]).join(", ") : "",
      emergencyContact: String(p.emergencyContact ?? ""),
    });
  }

  async function save() {
    if (!editing) return;
    const res = await fetch(`/api/admin/patients/${String(editing._id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        dob: form.dob || undefined,
        medicalHistory: form.medicalHistory
          ? form.medicalHistory.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        allergies: form.allergies
          ? form.allergies.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        emergencyContact: form.emergencyContact || undefined,
      }),
    });
    const json = await res.json();
    if (!json.ok) {
      alert(json.error);
      return;
    }
    setEditing(null);
    onRefresh();
  }

  async function remove(id: string) {
    if (!confirm("Soft-delete this patient and user?")) return;
    const res = await fetch(`/api/admin/patients/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.ok) {
      alert(json.error);
      return;
    }
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <GlassCard>
        <h2 className="text-lg font-semibold">Patients</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-slate-500">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Phone</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const u = p.userId as Record<string, unknown> | undefined;
                return (
                  <tr key={String(p._id)} className="border-b border-white/5">
                    <td className="py-2">{String(u?.name ?? "")}</td>
                    <td className="py-2">{String(u?.email ?? "")}</td>
                    <td className="py-2">{String(u?.phone ?? "")}</td>
                    <td className="py-2 space-x-2">
                      <button type="button" className="text-cyan-500 hover:underline" onClick={() => startEdit(p)}>
                        Edit
                      </button>
                      <button type="button" className="text-red-400 hover:underline" onClick={() => void remove(String(p._id))}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
      {editing && (
        <GlassCard>
          <h3 className="font-semibold">Edit patient</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(["name", "email", "phone", "dob", "emergencyContact"] as const).map((field) => (
              <label key={field} className="text-sm capitalize">
                {field === "dob" ? "Date of birth" : field}
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                  type={field === "dob" ? "date" : "text"}
                  value={form[field]}
                  onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                />
              </label>
            ))}
            <label className="text-sm md:col-span-2">
              Medical history (comma-separated)
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                value={form.medicalHistory}
                onChange={(e) => setForm((s) => ({ ...s, medicalHistory: e.target.value }))}
              />
            </label>
            <label className="text-sm md:col-span-2">
              Allergies (comma-separated)
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                value={form.allergies}
                onChange={(e) => setForm((s) => ({ ...s, allergies: e.target.value }))}
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <PrimaryButton type="button" onClick={() => void save()}>
              Save
            </PrimaryButton>
            <OutlineButton type="button" onClick={() => setEditing(null)}>
              Cancel
            </OutlineButton>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function StaffPanel({
  staff,
  branches,
  branchFilter,
  setBranchFilter,
  onRefresh,
}: {
  staff: Array<Record<string, unknown>>;
  branches: Array<Record<string, unknown>>;
  branchFilter: string;
  setBranchFilter: (v: string) => void;
  onRefresh: () => void;
}) {
  const [form, setForm] = useState({ branchId: "", name: "", title: "", email: "", phone: "" });

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branchId: form.branchId,
        name: form.name,
        title: form.title,
        email: form.email || undefined,
        phone: form.phone || undefined,
      }),
    });
    const json = await res.json();
    if (!json.ok) {
      alert(json.error);
      return;
    }
    setForm({ branchId: form.branchId, name: "", title: "", email: "", phone: "" });
    onRefresh();
  }

  async function del(id: string) {
    if (!confirm("Remove staff member?")) return;
    const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.ok) alert(json.error);
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <GlassCard>
        <h2 className="text-lg font-semibold">Staff roster</h2>
        <label className="mt-3 block text-sm">
          Filter by branch
          <select
            className="mt-1 w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={String(b._id)} value={String(b._id)}>
                {String(b.name)} ({String(b.code)})
              </option>
            ))}
          </select>
        </label>
        <ul className="mt-4 space-y-2 text-sm">
          {staff.map((s) => (
            <li key={String(s._id)} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span>
                {String(s.name)} — {String(s.title)}
              </span>
              <button type="button" className="text-red-400 hover:underline" onClick={() => void del(String(s._id))}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </GlassCard>
      <GlassCard>
        <h3 className="font-semibold">Add staff</h3>
        <form onSubmit={(e) => void createStaff(e)} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Branch
            <select
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={form.branchId}
              onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
            >
              <option value="">Select…</option>
              {branches.map((b) => (
                <option key={String(b._id)} value={String(b._id)}>
                  {String(b.name)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Name
            <input
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            Title
            <input
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            Email
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </label>
          <PrimaryButton type="submit" className="md:col-span-2">
            Add staff
          </PrimaryButton>
        </form>
      </GlassCard>
    </div>
  );
}

function InventoryPanel({
  items,
  branches,
  branchFilter,
  setBranchFilter,
  onRefresh,
}: {
  items: Array<Record<string, unknown>>;
  branches: Array<Record<string, unknown>>;
  branchFilter: string;
  setBranchFilter: (v: string) => void;
  onRefresh: () => void;
}) {
  const [form, setForm] = useState({ branchId: "", sku: "", name: "", quantity: "0", unit: "unit", reorderLevel: "5" });

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branchId: form.branchId,
        sku: form.sku,
        name: form.name,
        quantity: Number(form.quantity),
        unit: form.unit,
        reorderLevel: Number(form.reorderLevel),
      }),
    });
    const json = await res.json();
    if (!json.ok) {
      alert(json.error);
      return;
    }
    setForm({ branchId: form.branchId, sku: "", name: "", quantity: "0", unit: "unit", reorderLevel: "5" });
    onRefresh();
  }

  async function del(id: string) {
    if (!confirm("Delete SKU?")) return;
    const res = await fetch(`/api/admin/inventory/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.ok) alert(json.error);
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <GlassCard>
        <h2 className="text-lg font-semibold">Inventory</h2>
        <label className="mt-3 block text-sm">
          Filter by branch
          <select
            className="mt-1 w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={String(b._id)} value={String(b._id)}>
                {String(b.name)}
              </option>
            ))}
          </select>
        </label>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <li key={String(i._id)} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span>
                {String(i.name)} ({String(i.sku)}) — {String(i.quantity)} {String(i.unit ?? "")}
              </span>
              <button type="button" className="text-red-400 hover:underline" onClick={() => void del(String(i._id))}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </GlassCard>
      <GlassCard>
        <h3 className="font-semibold">Add item</h3>
        <form onSubmit={(e) => void createItem(e)} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Branch
            <select
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={form.branchId}
              onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
            >
              <option value="">Select…</option>
              {branches.map((b) => (
                <option key={String(b._id)} value={String(b._id)}>
                  {String(b.name)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            SKU
            <input
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            Name
            <input
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            Quantity
            <input
              required
              type="number"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            />
          </label>
          <PrimaryButton type="submit" className="md:col-span-2">
            Add item
          </PrimaryButton>
        </form>
      </GlassCard>
    </div>
  );
}

function BranchesPanel({
  branches,
  onRefresh,
}: {
  branches: Array<Record<string, unknown>>;
  onRefresh: () => void;
}) {
  const [form, setForm] = useState({ name: "", code: "", address: "", phone: "" });

  async function createBranch(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/branches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        code: form.code,
        address: form.address || undefined,
        phone: form.phone || undefined,
      }),
    });
    const json = await res.json();
    if (!json.ok) {
      alert(json.error);
      return;
    }
    setForm({ name: "", code: "", address: "", phone: "" });
    onRefresh();
  }

  async function del(id: string) {
    if (!confirm("Archive this branch?")) return;
    const res = await fetch(`/api/admin/branches/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.ok) alert(json.error);
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <GlassCard>
        <h2 className="text-lg font-semibold">Branches</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {branches.map((b) => (
            <li key={String(b._id)} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span>
                {String(b.name)} — {String(b.code)}
              </span>
              <button type="button" className="text-red-400 hover:underline" onClick={() => void del(String(b._id))}>
                Archive
              </button>
            </li>
          ))}
        </ul>
      </GlassCard>
      <GlassCard>
        <h3 className="font-semibold">Add branch</h3>
        <form onSubmit={(e) => void createBranch(e)} className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Name
            <input
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            Code
            <input
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              placeholder="CTR"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            />
          </label>
          <label className="text-sm md:col-span-2">
            Address
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </label>
          <label className="text-sm md:col-span-2">
            Phone
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </label>
          <PrimaryButton type="submit" className="md:col-span-2">
            Create branch
          </PrimaryButton>
        </form>
      </GlassCard>
    </div>
  );
}
