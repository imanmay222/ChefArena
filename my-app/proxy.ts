import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decodeSession } from "@/lib/auth/session-cookie";
import { canAccessAdmin, canManageUsers } from "@/lib/auth/permissions";

/**
 * DEMO ROUTE GATING ONLY — redirects based on the unsigned mock session
 * cookie. This is a UX convenience, not security: the Go backend must
 * authenticate every request and enforce role checks on every endpoint.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  const redirect = (to: string) => NextResponse.redirect(new URL(to, request.url));

  if (pathname === "/") return redirect(session ? "/dashboard" : "/login");

  if (pathname === "/login") return session ? redirect("/dashboard") : NextResponse.next();

  if (!session) {
    const next = encodeURIComponent(pathname + search);
    return redirect(`/login?next=${next}`);
  }

  if (pathname.startsWith("/admin")) {
    if (!canAccessAdmin(session.role)) return redirect("/forbidden");
    if (pathname.startsWith("/admin/users") && !canManageUsers(session.role)) return redirect("/forbidden");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)"],
};
