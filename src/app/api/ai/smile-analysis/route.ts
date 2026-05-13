import { ok, fail } from "@/lib/http";
import { aiSmileSchema } from "@/lib/validators";
import { buildSmileAnalysis } from "@/services/ai-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = aiSmileSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid smile analysis payload");
    return ok({ analysis: buildSmileAnalysis(parsed.data.age, parsed.data.concern) });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to analyze smile", 500);
  }
}
