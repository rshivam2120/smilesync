"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { OutlineButton } from "@/components/ui-kit";

export function LogoutButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Full navigation so layout/navbar session state resets (App Router layout persists on router.push).
      window.location.assign("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <OutlineButton
      type="button"
      disabled={busy}
      className={`inline-flex items-center gap-2 ${className ?? ""}`}
      onClick={() => void logout()}
    >
      <LogOut className="size-4 shrink-0" aria-hidden />
      {busy ? "Signing out…" : "Log out"}
    </OutlineButton>
  );
}
