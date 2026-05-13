"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setDevLink("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data?.data?.message ?? "Request processed.");
      if (data?.data?.devResetLink) setDevLink(data.data.devResetLink);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardTitle>Reset password</CardTitle>
      <CardDescription className="mt-1">Accounts that use email/password can set a new password. Social-only accounts should sign in with Google or phone.</CardDescription>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Button disabled={loading} className="w-full">{loading ? "Sending..." : "Send reset link"}</Button>
      </form>
      {message && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{message}</p>}
      {devLink && (
        <p className="mt-2 break-all rounded-lg bg-amber-500/15 p-2 text-xs text-amber-800 dark:text-amber-200">
          Dev only: <a className="underline" href={devLink}>{devLink}</a>
        </p>
      )}
      <p className="mt-4 text-center text-sm">
        <Link href="/auth/sign-in" className="text-cyan-600 hover:underline">Back to sign in</Link>
      </p>
    </Card>
  );
}
