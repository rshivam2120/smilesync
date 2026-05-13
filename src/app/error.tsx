"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong.</h2>
      <p className="mt-2 text-sm text-slate-500">Please retry or refresh the page.</p>
      <Button className="mt-4" onClick={() => reset()}>Try again</Button>
    </div>
  );
}
