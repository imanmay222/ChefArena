import type { Role } from "@/types";

/** UI-level checks only. The Go backend must enforce the same rules. */
export const canAccessAdmin = (role: Role | undefined) => role === "cp_lead" || role === "super_admin";
export const canManageUsers = (role: Role | undefined) => role === "super_admin";

export const ROLE_LABEL: Record<Role, string> = {
  member: "Member",
  cp_lead: "CP Lead",
  super_admin: "Super Admin",
};
