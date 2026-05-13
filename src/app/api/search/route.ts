import { ok } from "@/lib/http";
import { searchSite } from "@/lib/search-index";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (q.length < 2) return ok({ results: [] });
  const results = searchSite(q);
  return ok({ results });
}
