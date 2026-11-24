import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/settings",
  "/listening",
  "/reading",
  "/writing",
  "/speaking",
  "/vault",
  "/errors",
];

function hasBetterAuthSessionCookie(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get("better-auth.session_token")?.value ||
      request.cookies.get("__Secure-better-auth.session_token")?.value
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!hasBetterAuthSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/settings/:path*",
    "/listening/:path*",
    "/reading/:path*",
    "/writing/:path*",
    "/speaking/:path*",
    "/vault/:path*",
    "/errors/:path*",
  ],
};
