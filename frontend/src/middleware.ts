import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/profile",
  "/account-settings",
  "/verify-email",
  "/dashboard",
  "/users",
  "/settings",
  "/employees",
  "/tasks",
  "/expenses",
  "/payments",
  "/notifications",
  "/activity-logs",
];

const sessionCookieName =
  process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "business-management-system-session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(sessionCookieName);
  const hasSessionCookie = !!sessionCookie?.value;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Only gate protected routes. Guest routes are handled by GuestGuard so a
  // stale/invalid session cookie cannot create a redirect loop with AuthGuard.
  if (!hasSessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/profile",
    "/account-settings",
    "/verify-email",
    "/dashboard",
    "/users/:path*",
    "/settings/:path*",
    "/employees/:path*",
    "/tasks/:path*",
    "/expenses/:path*",
    "/payments/:path*",
    "/notifications/:path*",
    "/activity-logs/:path*",
  ],
};
