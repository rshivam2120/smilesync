import crypto from "crypto";
import { Payment } from "@/models";
import { getRazorpayClient } from "@/lib/server";

export async function createRazorpayOrder(input: {
  amount: number;
  purpose: string;
  referenceId?: string;
  userId: string;
}) {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local.");
  }

  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: input.amount,
      currency: "INR",
      receipt: `smilesync-${Date.now()}`,
      notes: { purpose: input.purpose, referenceId: input.referenceId ?? "" },
    });

    await Payment.create({
      userId: input.userId,
      razorpayOrderId: order.id,
      amount: input.amount,
      status: "created",
      purpose: input.purpose,
    });
    return order;
  } catch (error) {
    const err = error as {
      statusCode?: number;
      error?: { description?: string };
      description?: string;
      message?: string;
    };
    const providerMessage =
      err?.error?.description || err?.description || err?.message || "Razorpay order creation failed.";
    throw new Error(
      `Razorpay error: ${providerMessage}. Check test/live key pair, account activation, and server connectivity.`
    );
  }
}

export async function verifyRazorpayPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret")
    .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
    .digest("hex");

  const valid = expected === input.razorpay_signature;
  await Payment.findOneAndUpdate(
    { razorpayOrderId: input.razorpay_order_id },
    { $set: { status: valid ? "paid" : "failed" } },
    { new: true }
  );
  return valid;
}
