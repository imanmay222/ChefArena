import { DEMO_ACCOUNTS } from "@/lib/auth/demo-accounts";
import { endSession, startSession } from "@/lib/auth/session";
import type {
  CredentialErrors,
  Credentials,
  DemoAccount,
  SignInResult,
} from "@/types/auth";

/*
 * Mock sign-in for Phase 1. Credentials are checked in the browser against the
 * public demo accounts, so this is a UI demonstration, not authentication.
 * A real implementation should keep the same signIn/signOut shape.
 */

/** Short artificial delay so the loading state is visible, as with a network call. */
const MOCK_LATENCY_MS = 650;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials({ identifier, password }: Credentials): CredentialErrors {
  const errors: CredentialErrors = {};
  const trimmed = identifier.trim();

  if (!trimmed) {
    errors.identifier = "Enter your email or username.";
  } else if (trimmed.includes("@") && !EMAIL_PATTERN.test(trimmed)) {
    errors.identifier = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Enter your password.";
  }

  return errors;
}

/** Matches either the full email or its username part (e.g. "member"). */
function findAccount(identifier: string): DemoAccount | undefined {
  const needle = identifier.trim().toLowerCase();
  return DEMO_ACCOUNTS.find(
    (account) => account.email === needle || account.email.split("@")[0] === needle,
  );
}

export async function signIn(credentials: Credentials): Promise<SignInResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  const account = findAccount(credentials.identifier);
  if (!account || account.password !== credentials.password) {
    return {
      ok: false,
      error: "Incorrect email, username or password. Check your details and try again.",
    };
  }

  const { email, displayName, role } = account;
  const user = { email, displayName, role };
  startSession(user);
  return { ok: true, user };
}

export function signOut() {
  endSession();
}
