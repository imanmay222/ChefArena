import type { DemoAccount } from "@/types/auth";

/**
 * Publicly documented demo accounts for Phase 1. These are shown on the login
 * page on purpose; they are not secrets and must never be reused anywhere real.
 */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    email: "member@chefarena.demo",
    password: "Member@123",
    displayName: "Demo Member",
    role: "member",
  },
  {
    email: "lead@chefarena.demo",
    password: "Lead@123",
    displayName: "Demo CP Lead",
    role: "cp_lead",
  },
  {
    email: "admin@chefarena.demo",
    password: "Admin@123",
    displayName: "Demo Super Admin",
    role: "super_admin",
  },
];
