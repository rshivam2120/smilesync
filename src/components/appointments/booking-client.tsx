"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Slot = { time: string; available: boolean };

type DentistRow = { id: string; name: string; branch: string };

export function BookingClient() {
  const [dentists, setDentists] = useState<DentistRow[]>([]);
  const [dentistId, setDentistId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const dates = useMemo(() => Array.from({ length: 7 }).map((_, i) => format(addDays(new Date(), i), "yyyy-MM-dd")), []);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/dentists");
      const data = await res.json();
      const list = data?.data?.dentists ?? [];
      setDentists(list);
      setDentistId((prev) => prev || list[0]?.id || "");
    };
    load();
  }, []);

  useEffect(() => {
    if (!dentistId) return;
    const run = async () => {
      setLoading(true);
      const res = await fetch(`/api/appointments?dentistId=${dentistId}&date=${date}`);
      const data = await res.json();
      setSlots(data?.data?.slots ?? []);
      setLoading(false);
    };
    run();
  }, [dentistId, date]);

  const book = async () => {
    if (!selectedTime || !dentistId) return;
    setStatus("Booking...");
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dentistId,
        date,
        time: selectedTime,
        branch: "SmileSync Central",
        notes: "Initial consultation",
      }),
    });
    const data = await res.json();
    setStatus(data.ok ? "Appointment confirmed" : data.error || "Failed to book");
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardTitle>Live Availability Calendar</CardTitle>
        <CardDescription className="mt-2">Signed-in patients book against real dentists from your database.</CardDescription>
        <div className="mt-4 flex flex-wrap gap-2">
          {dates.map((d) => <Button variant={d === date ? "default" : "outline"} key={d} type="button" onClick={() => setDate(d)}>{d.slice(5)}</Button>)}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {loading ? <p className="col-span-3 text-sm">Loading slots...</p> : slots.map((s) => (
            <Button key={s.time} type="button" variant={selectedTime === s.time ? "default" : "outline"} disabled={!s.available} onClick={() => setSelectedTime(s.time)}>
              {s.time}
            </Button>
          ))}
        </div>
      </Card>
      <Card>
        <CardTitle>Doctor Selection</CardTitle>
        <div className="mt-3 space-y-2">
          {dentists.length === 0 && <p className="text-sm text-slate-500">No dentists yet — run <code className="text-xs">npm run seed</code>.</p>}
          {dentists.map((d) => (
            <button key={d.id} type="button" onClick={() => setDentistId(d.id)} className={`w-full rounded-xl border p-2 text-left text-sm dark:border-slate-700 ${dentistId === d.id ? "border-cyan-500 bg-cyan-500/10" : "border-slate-300/40"}`}>
              {d.name}
              <span className="block text-xs text-slate-500">{d.branch}</span>
            </button>
          ))}
        </div>
        <Button className="mt-4 w-full" type="button" onClick={book}>Confirm Booking</Button>
        {status && <Badge className="mt-3">{status}</Badge>}
      </Card>
    </div>
  );
}
