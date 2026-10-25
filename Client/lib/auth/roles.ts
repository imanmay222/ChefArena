import { ROLES, type MockSession, type Role } from "@/types/auth";

interface RoleConfig {
  label: string;
  /** Where a user with this role lands after signing in. */
  home: string;
}

export const ROLE_CONFIG: Record<Role, RoleConfig> = {
  member: { label: "Member", home: "/dashboard" },
  cp_lead: { label: "CP Lead", home: "/cp-lead" },
  super_admin: { label: "Super Admin", home: "/admin" },
};

export const LOGIN_ROUTE = "/login";

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function homeRouteFor(role: Role): string {
  return ROLE_CONFIG[role].home;
}

/**
 * The single access rule for role-specific workspaces: returns where the
 * visitor should be sent instead, or null when they may stay.
 */
export function getAccessRedirect(
  session: MockSession | null,
  requiredRole: Role,
): string | null {
  if (!session) return LOGIN_ROUTE;
  if (session.user.role !== requiredRole) return homeRouteFor(session.user.role);
  return null;
}
