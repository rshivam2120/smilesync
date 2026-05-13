import { connectDb } from "@/lib/server";
import { ok, fail } from "@/lib/http";
import { loginSchema } from "@/lib/validators";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { findUserByEmail } from "@/repositories/user-repository";

export async function POST(req: Request) {
  try {
    await connectDb();
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid login");

    const user = await findUserByEmail(parsed.data.email, { withPasswordFields: true });
    if (!user || !user.passwordHash) {
      return fail("Invalid email or password.", 401);
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) return fail("Invalid email or password.", 401);

    await setSessionCookie({
      userId: String(user._id),
      role: user.role,
      email: user.email,
      name: user.name,
    });

    return ok({
      user: { id: String(user._id), email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Login failed", 500);
  }
}
