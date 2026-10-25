export const ROLES = ["member", "cp_lead", "super_admin"] as const;

export type Role = (typeof ROLES)[number];

/** The public identity of a signed-in user. Never contains credentials. */
export interface AuthUser {
  email: string;
  displayName: string;
  role: Role;
}

/** A demo account used by the Phase 1 mock sign-in. Not a real credential store. */
export interface DemoAccount extends AuthUser {
  password: string;
}

/**
 * Frontend-only session kept in sessionStorage for local development.
 * It is trivially editable in DevTools and provides no security.
 */
export interface MockSession {
  kind: "mock-frontend-session";
  user: AuthUser;
  createdAt: string;
}

export interface Credentials {
  identifier: string;
  password: string;
}

export type CredentialErrors = Partial<Record<keyof Credentials, string>>;

export type SignInResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };
