import { connectDb } from "@/lib/server";
import { fail, ok } from "@/lib/http";
import { newsletterSchema } from "@/lib/validators";
import { NewsletterSubscriber } from "@/models";

export async function POST(req: Request) {
  try {
    await connectDb();
    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid email");

    await NewsletterSubscriber.findOneAndUpdate(
      { email: parsed.data.email.toLowerCase() },
      { $set: { subscribedAt: new Date(), source: "footer" } },
      { upsert: true, new: true }
    );

    return ok({ subscribed: true }, 201);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Subscribe failed", 500);
  }
}
