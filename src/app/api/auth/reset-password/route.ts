import crypto from "crypto";
import { connectDb } from "@/lib/server";
import { ok, fail } from "@/lib/http";
import { resetPasswordSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/auth";
import {
  clearPasswordResetFields,
  findUserForReset,
  updatePasswordHash,
} from "@/repositories/user-repository";

function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function POST(req: Request) {
  try {
    await connectDb();
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payload");

    const tokenHash = sha256Hex(parsed.data.token);
    const user = await findUserForReset(parsed.data.email, tokenHash);
    if (!user) return fail("Invalid or expired reset link.", 400);

    const passwordHash = await hashPassword(parsed.data.password);
    await updatePasswordHash(String(user._id), passwordHash);
    await clearPasswordResetFields(String(user._id));

    return ok({ message: "Password updated. You can sign in now." });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Reset failed", 500);
  }
}
