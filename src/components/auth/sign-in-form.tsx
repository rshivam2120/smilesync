"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

async function exchangeFirebaseSession(idToken: string) {
  const res = await fetch("/api/auth/firebase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || "Firebase sign-in failed");
  return data.data.user as { id: string; role: string };
}

export function SignInForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    googleProvider.setCustomParameters({ prompt: "select_account" });
  }, []);

  const ensureRecaptcha = () => {
    if (typeof window === "undefined") throw new Error("Recaptcha requires browser.");
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-auth", {
        size: "invisible",
        callback: () => {},
      });
    }
    return window.recaptchaVerifier;
  };

  const redirectByRole = (role: string) => {
    router.push(role === "admin" || role === "dentist" ? "/dashboard/admin" : "/dashboard/patient");
    router.refresh();
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Login failed");
      redirectByRole(data.data.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const idToken = await cred.user.getIdToken();
      const user = await exchangeFirebaseSession(idToken);
      redirectByRole(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const verifier = ensureRecaptcha();
      const formatted = phone.startsWith("+") ? phone : `+${phone.replace(/^0+/, "")}`;
      const cr = await signInWithPhoneNumber(auth, formatted, verifier);
      setConfirmation(cr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!confirmation) return;
    setError("");
    setLoading(true);
    try {
      const cred = await confirmation.confirm(otp);
      const idToken = await cred.user.getIdToken();
      const user = await exchangeFirebaseSession(idToken);
      redirectByRole(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardTitle>Sign in</CardTitle>
      <CardDescription className="mt-1">
        Email/password uses secure bcrypt. Google and SMS use Firebase; ensure{" "}
        <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">NEXT_PUBLIC_FIREBASE_PROJECT_ID</code>{" "}
        is your Firebase project ID string (not the numeric GCP project number).
      </CardDescription>

      <form onSubmit={submitEmail} className="mt-4 space-y-3">
        <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required autoComplete="email" />
        <Input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required autoComplete="current-password" minLength={8} />
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <Button disabled={loading} className="w-full" type="submit">{loading ? "Signing in..." : "Sign in with email"}</Button>
      </form>

      <div className="my-4 flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-500">or</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <Button variant="outline" type="button" className="w-full" disabled={loading} onClick={googleSignIn}>
        Continue with Google
      </Button>

      <div className="mt-4 space-y-2 rounded-xl border border-slate-200/80 p-3 dark:border-slate-700">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Phone (OTP)</p>
        <Input placeholder="Phone with country code e.g. 9198xxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {!confirmation ? (
          <Button variant="outline" type="button" className="w-full" disabled={loading || !phone} onClick={sendOtp}>Send OTP</Button>
        ) : (
          <>
            <Input placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <Button type="button" className="w-full" disabled={loading} onClick={verifyOtp}>Verify & sign in</Button>
          </>
        )}
      </div>

      <div id="recaptcha-auth" className="mt-2" />

      <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
        <Link href="/auth/register" className="text-cyan-600 hover:underline">Create account</Link>
        <Link href="/auth/forgot-password" className="text-cyan-600 hover:underline">Forgot password?</Link>
      </div>
    </Card>
  );
}
