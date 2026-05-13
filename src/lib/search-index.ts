import { services } from "@/lib/data";

/** Static site-wide search index — extend as pages grow */

export type SearchHit = {
  href: string;
  title: string;
  snippet: string;
  category: string;
  keywords: string;
};

export const SEARCH_INDEX: SearchHit[] = [
  { href: "/", title: "Home", snippet: "SmileSync landing — dental care platform", category: "Page", keywords: "home smile" },
  { href: "/about", title: "About", snippet: "Clinic story and team", category: "Page", keywords: "about mission vision" },
  { href: "/services", title: "Services", snippet: "All treatments and procedures", category: "Page", keywords: "services treatments" },
  { href: "/appointments", title: "Book appointment", snippet: "Schedule with live availability", category: "Product", keywords: "book schedule calendar slot" },
  { href: "/ai-smile-analysis", title: "AI Smile Scan", snippet: "Upload and analyze smile health", category: "Product", keywords: "ai scan whitening alignment" },
  { href: "/consultation", title: "Online consultation", snippet: "Video consultations", category: "Product", keywords: "video telehealth consult" },
  { href: "/membership", title: "Membership", snippet: "Basic Premium Family dental plans", category: "Product", keywords: "membership subscription pricing emi" },
  { href: "/contact", title: "Contact", snippet: "Location, timings, WhatsApp", category: "Page", keywords: "contact map emergency" },
  { href: "/auth/sign-in", title: "Sign in", snippet: "Patient and staff login", category: "Auth", keywords: "login signin account" },
  { href: "/auth/register", title: "Register", snippet: "Create patient account", category: "Auth", keywords: "signup register" },
];

const SERVICE_HITS: SearchHit[] = services.map((s) => ({
  href: `/services/${s.slug}`,
  title: s.name,
  snippet: s.description,
  category: "Service",
  keywords: `${s.name} ${s.slug} ${s.benefits.join(" ")}`.toLowerCase(),
}));

const FULL_INDEX = [...SEARCH_INDEX, ...SERVICE_HITS];

export function searchSite(query: string, limit = 8): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const score = (h: SearchHit) => {
    const blob = `${h.title} ${h.snippet} ${h.keywords} ${h.category}`.toLowerCase();
    let s = 0;
    const terms = q.split(/\s+/).filter(Boolean);
    for (const t of terms) {
      if (h.title.toLowerCase().includes(t)) s += 12;
      if (h.keywords.includes(t)) s += 6;
      if (blob.includes(t)) s += 3;
    }
    return s;
  };

  return [...FULL_INDEX]
    .map((h) => ({ h, s: score(h) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ h }) => h);
}
