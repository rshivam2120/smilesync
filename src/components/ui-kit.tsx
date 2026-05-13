"use client";

import Link from "next/link";
import { Bell, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Role } from "@/types";
import { NavbarSearch } from "@/components/NavbarSearch";
import { NewsletterForm } from "@/components/NewsletterForm";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";

export function GlassCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl dark:border-teal-400/20 dark:bg-slate-900/45", className)}>
      {children}
    </div>
  );
}

const primaryBtnClasses = "rounded-full bg-linear-to-r from-sky-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]";
const outlineBtnClasses = "rounded-full border border-slate-400/40 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800";

type BtnProps = { className?: string; children: ReactNode; href?: string } & ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ className, children, href, type = "button", ...rest }: BtnProps) {
  const merged = cn(primaryBtnClasses, className);
  if (href) return <Link href={href} className={cn(merged, "inline-flex items-center justify-center")}>{children}</Link>;
  return (
    <button type={type} className={merged} {...rest}>
      {children}
    </button>
  );
}

export function OutlineButton({ className, children, href, type = "button", ...rest }: BtnProps) {
  const merged = cn(outlineBtnClasses, className);
  if (href) return <Link href={href} className={cn(merged, "inline-flex items-center justify-center")}>{children}</Link>;
  return (
    <button type={type} className={merged} {...rest}>
      {children}
    </button>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="rounded-full border border-slate-300/40 p-2 dark:border-slate-700" aria-label="Toggle theme">
      {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}

const publicMenu = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/appointments", label: "Appointments" },
  { href: "/membership", label: "Membership" },
  { href: "/contact", label: "Contact" },
];

type NavSession = { role: Role; name?: string; email: string };

function dashboardHref(role: Role) {
  return role === "patient" ? "/dashboard/patient" : "/dashboard/admin";
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [session, setSession] = useState<NavSession | null | undefined>(undefined);
  const [loggingOut, setLoggingOut] = useState(false);
  const suggestions = useMemo(() => ["Whitening plans", "Braces cost", "Emergency slot", "Best dentist"], []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = (await res.json()) as { ok?: boolean; data?: { session: NavSession } };
        if (cancelled) return;
        if (json.ok && json.data?.session) setSession(json.data.session);
        else setSession(null);
      } catch {
        if (!cancelled) setSession(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.assign("/");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/60 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/70">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link href="/" className="text-xl font-bold tracking-wide">SmileSync</Link>
        <div className="hidden items-center gap-6 md:flex">
          {publicMenu.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-slate-700 transition hover:text-cyan-500 dark:text-slate-200">
              {item.label}
            </Link>
          ))}
          {session === undefined ? null : session ? (
            <>
              <Link href={dashboardHref(session.role)} className="text-sm font-medium text-cyan-600 transition hover:text-cyan-500 dark:text-cyan-400">
                Dashboard
              </Link>
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => void logout()}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/40 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <LogOut className="size-3.5" aria-hidden />
                {loggingOut ? "Signing out…" : "Log out"}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in" className="text-sm text-slate-700 transition hover:text-cyan-500 dark:text-slate-200">
                Sign in
              </Link>
              <Link href="/auth/register" className="text-sm text-slate-700 transition hover:text-cyan-500 dark:text-slate-200">
                Register
              </Link>
            </>
          )}
          <div className="group relative">
            <span className="cursor-default text-sm text-slate-700 dark:text-slate-200">Solutions</span>
            <div className="invisible absolute right-0 top-8 grid w-96 grid-cols-2 gap-2 rounded-2xl border border-slate-300/30 bg-white p-4 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900">
              <Link href="/ai-smile-analysis" className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium hover:bg-cyan-100 dark:bg-slate-800 dark:hover:bg-slate-700">AI Smile Scan</Link>
              <Link href="/consultation" className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium hover:bg-cyan-100 dark:bg-slate-800 dark:hover:bg-slate-700">Online Consultation</Link>
              <Link href="/dashboard/patient" className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium hover:bg-cyan-100 dark:bg-slate-800 dark:hover:bg-slate-700">Patient Portal</Link>
              <Link href="/dashboard/admin" className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium hover:bg-cyan-100 dark:bg-slate-800 dark:hover:bg-slate-700">Admin Dashboard</Link>
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <NavbarSearch />
          <div className="relative">
            <button onClick={() => setShowNotifications((p) => !p)} className="rounded-full border border-slate-300/40 p-2 dark:border-slate-700"><Bell className="size-4" /></button>
            {showNotifications && (
              <div className="absolute right-0 top-11 w-72 rounded-2xl border border-slate-300/30 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs text-slate-500">Notifications</p>
                <div className="mt-2 space-y-2 text-sm">
                  <p className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">Appointment confirmed for tomorrow at 11:00 AM.</p>
                  <p className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">New AI report is available.</p>
                </div>
              </div>
            )}
          </div>
          <ThemeToggle />
        </div>
        <button className="md:hidden" onClick={() => setOpen((p) => !p)}>{open ? <X /> : <Menu />}</button>
      </nav>
      {open && (
        <div className="space-y-3 border-t border-slate-300/40 px-4 py-4 md:hidden dark:border-slate-700">
          {publicMenu.map((item) => (
            <Link key={item.href} href={item.href} className="block text-sm">
              {item.label}
            </Link>
          ))}
          {session === undefined ? null : session ? (
            <>
              <Link href={dashboardHref(session.role)} className="block text-sm font-medium text-cyan-600 dark:text-cyan-400">
                Dashboard
              </Link>
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => void logout()}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-400/40 py-2 text-sm font-semibold"
              >
                <LogOut className="size-4" aria-hidden />
                {loggingOut ? "Signing out…" : "Log out"}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in" className="block text-sm">
                Sign in
              </Link>
              <Link href="/auth/register" className="block text-sm">
                Register
              </Link>
            </>
          )}
          <NavbarSearch className="w-full" />
          <div className="flex flex-wrap gap-2">{suggestions.map((s) => <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">{s}</span>)}</div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-300/30 px-4 py-12 dark:border-slate-700">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        <div>
          <h4 className="text-lg font-semibold">SmileSync</h4>
          <p className="mt-2 text-sm text-slate-500">Premium dental SaaS for futuristic clinics.</p>
        </div>
        <div>
          <h5 className="font-medium">Newsletter</h5>
          <NewsletterForm />
        </div>
        <p className="text-sm text-slate-500">24/7 Emergency: +91 9988 55 1122</p>
      </div>
    </footer>
  );
}

