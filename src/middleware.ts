import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import type { Role } from "@/types";

const SESSION_COOKIE = "smilesync-token";

function getJwtSecretKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
}

function jsonUnauthorized(message = "Unauthorized") {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

function jsonForbidden(message = "Forbidden") {
  return NextResponse.json({ ok: false, error: message }, { status: 403 });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const apiAuthPaths = [
    "/api/appointments",
    "/api/payments/create-order",
    "/api/consultations",
    "/api/dashboard/patient",
    "/api/admin",
  ];
  const needsApiAuth = apiAuthPaths.some((p) => pathname.startsWith(p));

  const pageAuthPaths = ["/dashboard/admin", "/dashboard/patient"];
  const needsPageAuth = pageAuthPaths.some((p) => pathname.startsWith(p));

  if (!needsApiAuth && !needsPageAuth) return NextResponse.next();

  if (!token) {
    if (needsApiAuth) return jsonUnauthorized();
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  let role: Role | undefined;
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    role = payload.role as Role | undefined;
  } catch {
    if (needsApiAuth) return jsonUnauthorized("Invalid session");
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  if (pathname.startsWith("/api/dashboard/patient")) {
    if (role !== "patient") return jsonForbidden();
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    if (role !== "admin" && role !== "dentist") return jsonForbidden();
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard/admin") && role !== "admin" && role !== "dentist") {
    return NextResponse.redirect(new URL("/dashboard/patient", request.url));
  }
  if (pathname.startsWith("/dashboard/patient") && role === "admin") {
    return NextResponse.redirect(new URL("/dashboard/admin", request.url));
  }

  if (needsApiAuth) {
    if (!role) return jsonUnauthorized();
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/appointments",
    "/api/appointments/:path*",
    "/api/payments/create-order",
    "/api/payments/create-order/:path*",
    "/api/consultations",
    "/api/consultations/:path*",
    "/api/dashboard/patient",
    "/api/dashboard/patient/:path*",
    "/api/admin",
    "/api/admin/:path*",
  ],
};
