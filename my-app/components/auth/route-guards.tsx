"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { getAccessRedirect, homeRouteFor } from "@/lib/auth/roles";
import { readSession, useMockSession } from "@/lib/auth/session";
import type { MockSession, Role } from "@/types/auth";

/*
 * Client-side guards for the Phase 1 demo. They only steer navigation in the
 * browser and are NOT authorization: the pages remain publicly fetchable.
 */

interface RequireRoleProps {
  role: Role;
  children: (session: MockSession) => ReactNode;
}

/** Renders children only for a session with `role`; otherwise redirects. */
export function RequireRole({ role, children }: RequireRoleProps) {
  const router = useRouter();
  const session = useMockSession();
  const redirectTo = session === undefined ? null : getAccessRedirect(session, role);

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (!session || redirectTo) {
    return (
      <div role="status" className="flex flex-1 items-center justify-center gap-2 text-sm text-muted">
        <LoaderCircle className="size-4 animate-spin" aria-hidden />
        {session === undefined ? "Checking your session…" : "Redirecting…"}
      </div>
    );
  }

  return children(session);
}

/** Sends an already signed-in visitor to their workspace. */
export function RedirectIfSignedIn() {
  const router = useRouter();

  // Runs on mount and whenever the page is shown again after navigation.
  useEffect(() => {
    const session = readSession();
    if (session) router.replace(homeRouteFor(session.user.role));
  }, [router]);

  return null;
}
