"use client";

import { useState } from "react";
import { membershipPlans } from "@/lib/data";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function MembershipClient() {
  const [message, setMessage] = useState("");

  const pay = async (plan: string) => {
    setMessage("Creating Razorpay order...");
    const meRes = await fetch("/api/auth/me");
    const me = await meRes.json();
    const userId = me?.data?.session?.userId;
    if (!userId) {
      setMessage("Please sign in first.");
      return;
    }
    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: plan === "basic" ? 199900 : plan === "premium" ? 499900 : 849900, purpose: "membership", userId, referenceId: plan }),
    });
    const data = await res.json();
    if (!data.ok) {
      setMessage(data.error || "Unable to create order");
      return;
    }
    setMessage(`Order created (${data.data.order.id}). Add Razorpay Checkout key to enable hosted popup.`);
  };

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {membershipPlans.map((p) => (
        <Card key={p.id}>
          <Badge>SAVE 15%</Badge>
          <CardTitle className="mt-3">{p.name}</CardTitle>
          <p className="my-2 text-2xl font-bold">{p.price}</p>
          <ul className="space-y-1 text-sm text-slate-500">{p.perks.map((perk) => <li key={perk}>• {perk}</li>)}</ul>
          <Button className="mt-4 w-full" onClick={() => pay(p.id)}>Pay with Razorpay</Button>
        </Card>
      ))}
      <Card className="md:col-span-3">
        <CardTitle>Benefits Comparison</CardTitle>
        <CardDescription className="mt-2">Basic: routine care | Premium: priority + advanced diagnostics | Family: coverage up to 4 members.</CardDescription>
        {message && <p className="mt-3 text-sm text-cyan-600">{message}</p>}
      </Card>
    </div>
  );
}
