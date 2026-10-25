import type { Role, User } from "@/types";
import { SESSION_COOKIE, decodeSession, encodeSession, type DemoSession } from "@/lib/auth/session-cookie";
import { ServiceError } from "@/lib/services/errors";
import { getDb } from "./db";

const DAY_S = 24 * 60 * 60;

export function readSession(): DemoSession | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return decodeSession(match?.slice(SESSION_COOKIE.length + 1));
}

export function writeSession(user: User, remember: boolean) {
  const maxAge = remember ? 30 * DAY_S : DAY_S;
  const value = encodeSession({ uid: user.id, role: user.role, exp: Date.now() + maxAge * 1000 });
  // Persistent only with "remember me"; otherwise a browser-session cookie.
  document.cookie = `${SESSION_COOKIE}=${value}; Path=/; SameSite=Lax${remember ? `; Max-Age=${maxAge}` : ""}`;
}

export function clearSession() {
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function currentUser(): User | null {
  const session = readSession();
  if (!session) return null;
  const user = getDb().users.find((u) => u.id === session.uid);
  return user && user.status === "active" ? user : null;
}

export function requireUser(): User {
  const user = currentUser();
  if (!user) throw new ServiceError("Your session has expired. Please sign in again.", "unauthorized");
  return user;
}

/** Demonstration-only authorisation. The Go backend must enforce this. */
export function requireRole(...roles: Role[]): User {
  const user = requireUser();
  if (!roles.includes(user.role)) throw new ServiceError("You do not have permission to perform this action.", "forbidden");
  return user;
}
