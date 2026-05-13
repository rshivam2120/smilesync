import { createRemoteJWKSet, jwtVerify } from "jose";

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

export type FirebaseTokenClaims = {
  uid: string;
  email?: string;
  name?: string;
  phone?: string;
};

/**
 * Verifies a Firebase Auth ID token using Google's JWKS (no service account required).
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID must be the Firebase **project ID string** (e.g. my-app-id), not the numeric GCP project number.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<FirebaseTokenClaims> {
  if (!FIREBASE_PROJECT_ID || FIREBASE_PROJECT_ID === "demo") {
    throw new Error(
      "Firebase is not configured: set NEXT_PUBLIC_FIREBASE_PROJECT_ID to your Firebase project ID string from the Firebase console."
    );
  }

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    audience: FIREBASE_PROJECT_ID,
  });

  const uid = typeof payload.sub === "string" ? payload.sub : "";
  if (!uid) throw new Error("Invalid Firebase token: missing subject.");

  return {
    uid,
    email: typeof payload.email === "string" ? payload.email : undefined,
    name: typeof payload.name === "string" ? payload.name : undefined,
    phone: typeof payload.phone_number === "string" ? payload.phone_number : undefined,
  };
}
