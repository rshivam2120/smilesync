import { connectDb } from "@/lib/server";
import { ok, fail } from "@/lib/http";
import { paymentVerifySchema } from "@/lib/validators";
import { verifyRazorpayPayment } from "@/services/payment-service";

export async function POST(req: Request) {
  try {
    await connectDb();
    const body = await req.json();
    const parsed = paymentVerifySchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid verification payload");
    const verified = await verifyRazorpayPayment(parsed.data);
    if (!verified) return fail("Payment signature verification failed", 400);
    return ok({ verified: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to verify payment", 500);
  }
}
