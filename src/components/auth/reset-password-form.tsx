"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenDefault = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const emailDefault = useMemo(() => searchParams.get("email") ?? "", [searchParams]);

  const [token, setToken] = useState(tokenDefault);
  const [email, setEmail] = useState(emailDefault);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Reset failed");
      setDone(true);
      setTimeout(() => router.push("/auth/sign-in"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardTitle>New password</CardTitle>
      <CardDescription className="mt-1">Enter the token from your reset email (dev link) and choose a new password.</CardDescription>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} required />
        <Input type="password" placeholder="New password (min 8)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        {error && <p className="text-xs text-rose-500">{error}</p>}
        {done && <p className="text-sm text-emerald-600">Password updated. Redirecting...</p>}
        <Button disabled={loading || done} className="w-full">{loading ? "Saving..." : "Update password"}</Button>
      </form>
      <p className="mt-4 text-center text-sm">
        <Link href="/auth/sign-in" className="text-cyan-600 hover:underline">Sign in</Link>
      </p>
    </Card>
  );
}
