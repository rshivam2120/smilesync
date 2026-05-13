"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Registration failed");
      router.push("/dashboard/patient");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardTitle>Create account</CardTitle>
      <CardDescription className="mt-1">New patients register here. Admins and dentists use seeded credentials.</CardDescription>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <Input placeholder="Full name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required minLength={2} />
        <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
        <Input placeholder="Password (min 8 characters)" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required minLength={8} />
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <Button disabled={loading} className="w-full">{loading ? "Creating account..." : "Register"}</Button>
      </form>
      <p className="mt-3 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="font-medium text-cyan-600 hover:underline">Sign in</Link>
      </p>
    </Card>
  );
}
