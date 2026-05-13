"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Hit = { href: string; title: string; snippet: string; category: string };

export function NavbarSearch({ className }: { className?: string }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const runSearch = useCallback((query: string) => {
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    void fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
      .then((r) => r.json())
      .then((data) => {
        setHits(data?.data?.results ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runSearch(q), 220);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, runSearch]);

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2 rounded-full border border-slate-300/40 px-3 py-1.5 dark:border-slate-700">
        <Search className="size-4 shrink-0 opacity-60" aria-hidden />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          placeholder="Search..."
          className="w-32 min-w-0 bg-transparent text-sm outline-none md:w-44"
          aria-label="Site search"
          aria-expanded={open}
          aria-controls="site-search-results"
        />
      </div>
      {open && (q.trim().length >= 2 || loading) && (
        <div id="site-search-results" role="listbox" className="absolute right-0 top-11 z-50 max-h-72 w-[min(100vw-2rem,320px)] overflow-auto rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {loading ? <p className="px-3 py-2 text-xs text-slate-500">Searching…</p> : null}
          {!loading && hits.length === 0 && q.trim().length >= 2 ? (
            <p className="px-3 py-2 text-xs text-slate-500">No matches</p>
          ) : null}
          {!loading &&
            hits.map((h) => (
              <Link
                key={h.href + h.title}
                href={h.href}
                role="option"
                className="block rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setOpen(false)}
              >
                <span className="font-medium">{h.title}</span>
                <span className="ml-2 text-[10px] uppercase tracking-wide text-cyan-600">{h.category}</span>
                <p className="line-clamp-2 text-xs text-slate-500">{h.snippet}</p>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
