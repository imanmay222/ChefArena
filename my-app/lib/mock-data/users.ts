import type { User } from "@/types";
import type { Timeline } from "./timeline";

/** The three documented demo accounts (local development only). */
export const DEMO_ACCOUNTS = {
  member: { userId: "u_member", email: "member@chefarena.demo" },
  lead: { userId: "u_lead", email: "lead@chefarena.demo" },
  admin: { userId: "u_admin", email: "admin@chefarena.demo" },
} as const;

/**
 * Demo password for the three accounts above. It only exists so the mock
 * adapter can exercise the login UI; it is never persisted anywhere.
 */
export const DEMO_PASSWORD = "chefarena-demo";

const DEPT = "Computer Science & Engineering";

export function seedUsers(t: Timeline): User[] {
  const base = (u: Partial<User> & Pick<User, "id" | "handle" | "name" | "email">): User => ({
    role: "member",
    department: DEPT,
    batch: "2023",
    rating: 1500,
    maxRating: 1500,
    status: "active",
    invitation: "accepted",
    joinedAt: t.daysAgo(320),
    lastActiveAt: t.daysAgo(0, 2),
    ...u,
  });

  return [
    base({ id: "u_member", handle: "aarav_codes", name: "Aarav Menon", email: DEMO_ACCOUNTS.member.email, rating: 1642, maxRating: 1668, lastActiveAt: t.daysAgo(0) }),
    base({ id: "u_lead", handle: "priya_r", name: "Priya Raghavan", email: DEMO_ACCOUNTS.lead.email, role: "cp_lead", batch: "2022", rating: 1984, maxRating: 2031, joinedAt: t.daysAgo(610) }),
    base({ id: "u_admin", handle: "kiyer", name: "Karthik Iyer", email: DEMO_ACCOUNTS.admin.email, role: "super_admin", batch: "Faculty", rating: 0, maxRating: 0, joinedAt: t.daysAgo(700) }),
    base({ id: "u_sneha", handle: "sneha_p", name: "Sneha Pillai", email: "sneha.p@chefarena.demo", rating: 1812, maxRating: 1840, batch: "2022" }),
    base({ id: "u_rohan", handle: "rohan.d", name: "Rohan Das", email: "rohan.d@chefarena.demo", rating: 1726, maxRating: 1751 }),
    base({ id: "u_ananya", handle: "ananya_rao", name: "Ananya Rao", email: "ananya.r@chefarena.demo", rating: 1689, maxRating: 1702, batch: "2024" }),
    base({ id: "u_meera", handle: "meerak", name: "Meera Krishnan", email: "meera.k@chefarena.demo", rating: 1591, maxRating: 1630 }),
    base({ id: "u_vikram", handle: "vik_shetty", name: "Vikram Shetty", email: "vikram.s@chefarena.demo", rating: 1504, maxRating: 1556, batch: "2024", lastActiveAt: t.daysAgo(3) }),
    base({ id: "u_ishaan", handle: "ishaan_g", name: "Ishaan Gupta", email: "ishaan.g@chefarena.demo", rating: 1452, maxRating: 1470, batch: "2025", joinedAt: t.daysAgo(60) }),
    base({ id: "u_diya", handle: "diya.n", name: "Diya Nair", email: "diya.n@chefarena.demo", rating: 1478, maxRating: 1478, batch: "2025", joinedAt: t.daysAgo(45) }),
    base({ id: "u_arjun", handle: "arjun_m", name: "Arjun Mehta", email: "arjun.m@chefarena.demo", rating: 0, maxRating: 0, batch: "2025", invitation: "pending", joinedAt: t.daysAgo(2), lastActiveAt: null }),
  ];
}
