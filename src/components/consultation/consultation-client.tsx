"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassCard, PrimaryButton, OutlineButton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { dentists as staticDentists } from "@/lib/data";

type DentistRow = { id: string; name: string; branch: string; specialization: string };
type Consultation = {
  _id: string;
  status: "active" | "completed";
  notes: string;
  chat: { role: "patient" | "assistant"; text: string; createdAt: string }[];
  prescriptionDraft?: { medications: { name: string; dosage: string; duration: string }[]; advice: string };
};

export function ConsultationClient() {
  const [dentists, setDentists] = useState<DentistRow[]>([]);
  const [selectedDentistId, setSelectedDentistId] = useState<string>("");

  const [loadingDentists, setLoadingDentists] = useState(true);
  const [creating, setCreating] = useState(false);
  const [consultation, setConsultation] = useState<Consultation | null>(null);

  const [chatInput, setChatInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [generatingRx, setGeneratingRx] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");

  const chatMessages = useMemo(() => consultation?.chat ?? [], [consultation]);
  const consultationId = consultation?._id ?? "";

  useEffect(() => {
    const run = async () => {
      try {
        setLoadingDentists(true);
        const res = await fetch("/api/dentists");
        const data = await res.json();
        const list = data?.data?.dentists ?? [];
        if (list.length) {
          setDentists(list);
          setSelectedDentistId((prev) => prev || list[0].id);
          return;
        }
        // Fallback when DB is empty: show static profiles.
        setDentists(staticDentists.map((d, i) => ({ id: `dentist-demo-${i + 1}`, name: d.name, branch: "", specialization: d.role })));
        setSelectedDentistId("dentist-demo-1");
      } finally {
        setLoadingDentists(false);
      }
    };
    void run();
  }, []);

  const startConsultation = async () => {
    if (!selectedDentistId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dentistId: selectedDentistId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to start consultation");
      setConsultation(data.data.consultation);
      setNotesDraft(data.data.consultation?.notes ?? "");
    } finally {
      setCreating(false);
    }
  };

  const sendChat = async () => {
    if (!consultationId || !chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput("");
    setConsultation((c) =>
      c
        ? {
            ...c,
            chat: [...c.chat, { role: "patient", text, createdAt: new Date().toISOString() }],
          }
        : c
    );

    const res = await fetch(`/api/consultations/${consultationId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) return;

    const reply = data.data.response ?? data.response ?? "";
    setConsultation((c) =>
      c
        ? {
            ...c,
            chat: [...c.chat, { role: "assistant", text: String(reply), createdAt: new Date().toISOString() }],
          }
        : c
    );
  };

  const saveNotes = async () => {
    if (!consultationId) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/consultations/${consultationId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesDraft }),
      });
      const data = await res.json();
      if (res.ok && data?.data?.consultation) {
        setConsultation(data.data.consultation);
      }
    } finally {
      setSavingNotes(false);
    }
  };

  const generatePrescription = async () => {
    if (!consultationId) return;
    setGeneratingRx(true);
    try {
      const res = await fetch(`/api/consultations/${consultationId}/prescription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesDraft }),
      });
      const data = await res.json();
      if (res.ok && data?.data?.prescription && data?.data?.consultation) {
        setConsultation(data.data.consultation);
      }
    } finally {
      setGeneratingRx(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <CardTitle>Video Consultation</CardTitle>
          <CardDescription className="mt-2">
            A production-ready UI segment with chat, secure notes, and prescription generation saved to MongoDB. Video is a mock layout (ready for WebRTC integration).
          </CardDescription>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200/60 bg-linear-to-br from-cyan-200/20 to-indigo-200/20 dark:border-slate-800">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(6,182,212,0.35),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.25),transparent_40%)]" />
              <div className="absolute inset-x-0 bottom-4 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
                Patient video preview (mock)
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200/60 bg-linear-to-br from-teal-200/20 to-slate-200/10 dark:border-slate-800">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.25),transparent_55%),radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.18),transparent_45%)]" />
              <div className="absolute inset-x-0 bottom-4 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
                Clinician video preview (mock)
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {consultation ? `Consultation active · ${consultation.status.toUpperCase()}` : "Select a dentist and start"}
            </div>
            <div className="flex gap-2">
              <OutlineButton className="px-4 py-2" type="button">
                Screen share (mock)
              </OutlineButton>
              <PrimaryButton className="px-4 py-2" type="button" onClick={startConsultation}>
                {creating ? "Starting..." : consultation ? "Restart" : "Start Secure Consultation"}
              </PrimaryButton>
            </div>
          </div>
        </GlassCard>

        <Card className="lg:col-span-1">
          <CardTitle>Clinician</CardTitle>
          <CardDescription className="mt-2">Choose your dentist. Booking uses real dentist data from MongoDB.</CardDescription>

          <div className="mt-4 space-y-2">
            {loadingDentists ? (
              <>
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </>
            ) : (
              dentists.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDentistId(d.id)}
                  className={`w-full rounded-xl border p-2 text-left text-sm transition dark:border-slate-700 ${
                    selectedDentistId === d.id ? "border-cyan-500 bg-cyan-500/10" : "border-slate-300/40"
                  }`}
                >
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{d.branch || d.specialization || "Clinician"}</div>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Consultation Chat</CardTitle>
            <div className="text-xs text-slate-500 dark:text-slate-400">Saved to consultation session</div>
          </div>

          {!consultation ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300/50 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Start a consultation to enable chat and prescription generation.
            </div>
          ) : (
            <>
              <div className="mt-4 max-h-72 overflow-y-auto rounded-2xl border border-slate-200/60 bg-white/40 p-3 dark:border-slate-800 dark:bg-slate-950/20">
                {chatMessages.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet.</p>
                ) : (
                  <div className="space-y-2">
                    {chatMessages.map((m, i) => (
                      <div key={i} className={`rounded-xl px-3 py-2 text-xs ${m.role === "patient" ? "ml-6 bg-cyan-900/70 text-cyan-50" : "mr-4 bg-slate-800 text-white"}`}>
                        {m.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Describe symptoms or ask questions..."
                  aria-label="Chat input"
                  disabled={!consultation}
                />
                <Button type="button" className="whitespace-nowrap" disabled={!consultation || !chatInput.trim()} onClick={() => void sendChat()}>
                  Send
                </Button>
              </div>
            </>
          )}
        </GlassCard>

        <GlassCard>
          <CardTitle>Notes + Prescription</CardTitle>
          <CardDescription className="mt-2">Write notes, save, then generate a clinician-reviewable prescription draft.</CardDescription>

          <div className="mt-4 space-y-3">
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Add symptoms, duration, sensitivity, pain level, allergies..."
              className="min-h-[180px] w-full resize-none rounded-xl border border-slate-300/40 bg-transparent px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700"
              disabled={!consultation}
            />
            <div className="flex gap-2">
              <Button type="button" className="flex-1" onClick={() => void saveNotes()} disabled={!consultation || savingNotes}>
                {savingNotes ? "Saving..." : "Save Notes"}
              </Button>
              <Button type="button" className="flex-1" onClick={() => void generatePrescription()} disabled={!consultation || generatingRx}>
                {generatingRx ? "Generating..." : "Generate Rx"}
              </Button>
            </div>
          </div>

          {consultation?.prescriptionDraft ? (
            <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white/40 p-4 dark:border-slate-800 dark:bg-slate-950/20">
              <div className="text-sm font-semibold">Prescription Draft</div>
              <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {consultation.prescriptionDraft.medications.map((m) => (
                  <li key={m.name}>
                    <b>{m.name}</b> · {m.dosage} · {m.duration}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">{consultation.prescriptionDraft.advice}</p>
              <p className="mt-2 text-[10px] text-rose-600/80">
                Educational draft only. Clinician must confirm final treatment.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300/50 p-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No prescription draft yet.
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

