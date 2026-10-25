import type { Role } from "@/types";

/**
 * DEMO SESSION ONLY.
 *
 * The mock adapter stores `{ uid, role, exp }` in a readable, unsigned cookie
 * so `proxy.ts` can redirect between /login, the app and /forbidden. It holds
 * no credentials. Anyone can forge it, which is acceptable only because there
 * is no real data behind it. Production must use an HttpOnly, Secure session
 * issued and verified by the Go backend; all authorisation must be enforced
 * server-side.
 */
export const SESSION_COOKIE = "ca_demo_session";

export interface DemoSession {
  uid: string;
  role: Role;
  exp: number;
}

export function encodeSession(session: DemoSession): string {
  return btoa(JSON.stringify(session)).replace(/=+$/, "");
}

export function decodeSession(value: string | undefined | null, now = Date.now()): DemoSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(atob(decodeURIComponent(value))) as Partial<DemoSession>;
    if (typeof parsed.uid !== "string" || typeof parsed.role !== "string" || typeof parsed.exp !== "number") return null;
    if (parsed.exp < now) return null;
    if (!["member", "cp_lead", "super_admin"].includes(parsed.role)) return null;
    return parsed as DemoSession;
  } catch {
    return null;
  }
}
