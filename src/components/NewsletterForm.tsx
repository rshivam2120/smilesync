"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/ui-kit";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setStatus("ok");
      setMsg("You are subscribed.");
      setEmail("");
    } catch {
      setStatus("err");
      setMsg("Could not subscribe. Try again.");
    }
  };

  return (
    <form onSubmit={submit} className="mt-2 flex flex-wrap gap-2">
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-[200px] flex-1 rounded-xl border border-slate-300/40 bg-transparent px-3 py-2 text-sm outline-none ring-cyan-500 focus:ring-2 dark:border-slate-700"
        placeholder="Email address"
        aria-label="Newsletter email"
      />
      <PrimaryButton type="submit" disabled={status === "loading"}>{status === "loading" ? "…" : "Subscribe"}</PrimaryButton>
      {(status === "ok" || status === "err") && <p className="w-full text-xs text-slate-500">{msg}</p>}
    </form>
  );
}
