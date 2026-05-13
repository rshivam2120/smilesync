import crypto from "crypto";
import { connectDb } from "@/lib/server";
import { ok, fail } from "@/lib/http";
import { forgotPasswordSchema } from "@/lib/validators";
import { findUserByEmail, setPasswordResetFields } from "@/repositories/user-repository";

function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function POST(req: Request) {
  try {
    await connectDb();
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid email");

    const user = await findUserByEmail(parsed.data.email, { withPasswordFields: true });
    const generic = {
      message: "If an account exists for this email, password reset instructions have been processed.",
    };

    if (!user?.passwordHash) {
      return ok(generic);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256Hex(rawToken);
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await setPasswordResetFields(user.email, tokenHash, expires);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink =
      process.env.NODE_ENV === "development"
        ? `${appUrl}/auth/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(user.email)}`
        : undefined;

    return ok({ ...generic, ...(resetLink ? { devResetLink: resetLink } : {}) });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Request failed", 500);
  }
}
