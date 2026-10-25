import type { AuthService } from "@/lib/services/contracts";
import { ServiceError } from "@/lib/services/errors";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/mock-data/users";
import { clone, getDb, latency } from "./db";
import { clearSession, currentUser, writeSession } from "./session";

const DEMO_IDS = new Set<string>(Object.values(DEMO_ACCOUNTS).map((a) => a.userId));

export const mockAuthService: AuthService = {
  async login({ identifier, password, remember }) {
    await latency(650);
    const needle = identifier.trim().toLowerCase();
    const user = getDb().users.find((u) => u.email.toLowerCase() === needle || u.handle.toLowerCase() === needle);
    // Same message for unknown accounts and wrong passwords.
    if (!user || !DEMO_IDS.has(user.id) || password !== DEMO_PASSWORD) {
      throw new ServiceError("Invalid email or password.", "unauthorized");
    }
    if (user.status !== "active") throw new ServiceError("This account has been deactivated. Contact your CP lead.", "forbidden");
    writeSession(user, remember);
    return clone(user);
  },

  async logout() {
    await latency(150);
    clearSession();
  },

  async getCurrentUser() {
    await latency(80);
    const user = currentUser();
    return user ? clone(user) : null;
  },

  async requestPasswordReset() {
    await latency(500);
    // Intentionally a no-op: the mock adapter cannot send email.
  },
};
