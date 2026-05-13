import { ok, fail } from "@/lib/http";
import { aiChatSchema } from "@/lib/validators";
import { respondToSymptom } from "@/services/ai-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = aiChatSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid message");
    return ok({ response: respondToSymptom(parsed.data.message) });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to process chatbot request", 500);
  }
}
