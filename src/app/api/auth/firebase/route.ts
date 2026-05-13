import { connectDb } from "@/lib/server";
import { ok, fail } from "@/lib/http";
import { firebaseSessionSchema } from "@/lib/validators";
import { setSessionCookie } from "@/lib/auth";
import { verifyFirebaseIdToken } from "@/lib/firebase-token";
import { upsertFirebaseUser } from "@/repositories/user-repository";
import { Patient } from "@/models";

export async function POST(req: Request) {
  try {
    await connectDb();
    const body = await req.json();
    const parsed = firebaseSessionSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid payload");

    const claims = await verifyFirebaseIdToken(parsed.data.idToken);

    const email =
      claims.email ??
      (claims.phone ? `${claims.uid}@phone.smilesync.local` : undefined);

    if (!email && !claims.phone) {
      return fail("Firebase account has no email or phone linked.", 400);
    }

    const user = await upsertFirebaseUser({
      firebaseUid: claims.uid,
      email: claims.email,
      phone: claims.phone,
      name: claims.name,
      defaultRole: "patient",
    });

    if (!user) return fail("Could not create or update user.", 500);

    if (user.role === "patient") {
      const hasPatient = await Patient.exists({ userId: user._id });
      if (!hasPatient) await Patient.create({ userId: user._id });
    }

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
    const message = error instanceof Error ? error.message : "Firebase login failed";
    return fail(message, 401);
  }
}
