import { connectDb } from "@/lib/server";
import { ok, fail } from "@/lib/http";
import { paymentOrderSchema } from "@/lib/validators";
import { createRazorpayOrder } from "@/services/payment-service";
import { requireRole } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const role = await requireRole(["admin", "dentist", "patient"]);
    if (!role) return fail("Unauthorized", 401);
    await connectDb();
    const body = await req.json();
    const parsed = paymentOrderSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payment payload");
    const order = await createRazorpayOrder(parsed.data);
    return ok({ order }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    // Helpful server log for debugging payment setup issues.
    console.error("[payments/create-order]", message);
    return fail(message, 500);
  }
}
