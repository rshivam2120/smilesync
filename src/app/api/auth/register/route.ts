import { connectDb } from "@/lib/server";
import { ok, fail } from "@/lib/http";
import { registerSchema } from "@/lib/validators";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { createPasswordUser, findUserByEmail } from "@/repositories/user-repository";
import { Patient } from "@/models";

/** Public sign-up: always creates a patient account (admins/dentists use seed or internal provisioning). */
export async function POST(req: Request) {
  try {
    await connectDb();
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid registration");

    const exists = await findUserByEmail(parsed.data.email);
    if (exists) return fail("An account with this email already exists.", 409);

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await createPasswordUser({
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash,
      role: "patient",
    });

    await Patient.create({ userId: user._id });

    await setSessionCookie({
      userId: String(user._id),
      role: "patient",
      email: user.email,
      name: user.name,
    });

    return ok({ user: { id: String(user._id), email: user.email, name: user.name, role: user.role } }, 201);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Registration failed", 500);
  }
}
