import { useSyncExternalStore } from "react";
import { isRole } from "@/lib/auth/roles";
import type { AuthUser, MockSession } from "@/types/auth";

/*
 * Mock frontend session for local development only.
 *
 * The session lives in sessionStorage so it survives refreshes but ends with
 * the tab. Anyone can edit it in DevTools, so it must never be treated as
 * proof of identity. Replace this module when a real backend exists.
 */

const STORAGE_KEY = "chefarena:mock-session";

const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cachedSession: MockSession | null = null;

function parseSession(raw: string | null): MockSession | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { kind, user, createdAt } = value as Partial<MockSession>;
    if (
      kind !== "mock-frontend-session" ||
      typeof createdAt !== "string" ||
      typeof user?.email !== "string" ||
      typeof user.displayName !== "string" ||
      !isRole(user.role)
    ) {
      return null;
    }
    return {
      kind,
      createdAt,
      user: { email: user.email, displayName: user.displayName, role: user.role },
    };
  } catch {
    return null;
  }
}

/** Returns the current session, or null. Stable between calls while unchanged. */
export function readSession(): MockSession | null {
  let raw: string | null;
  try {
    raw = window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSession = parseSession(raw);
  }
  return cachedSession;
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function startSession(user: AuthUser): MockSession {
  const session: MockSession = {
    kind: "mock-frontend-session",
    user,
    createdAt: new Date().toISOString(),
  };
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage can be unavailable (e.g. blocked site data); the demo still navigates.
  }
  notify();
  return session;
}

export function endSession() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Subscribes a Client Component to the mock session.
 * `undefined` means "not known yet" (server render and hydration).
 */
export function useMockSession(): MockSession | null | undefined {
  return useSyncExternalStore<MockSession | null | undefined>(
    subscribe,
    readSession,
    () => undefined,
  );
}
