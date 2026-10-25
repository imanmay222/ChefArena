import {
  Bell,
  CalendarRange,
  Dumbbell,
  FileCode2,
  FlaskConical,
  Gavel,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Medal,
  ScrollText,
  Settings,
  ShieldCheck,
  Trophy,
  User,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Only highlight on exact match (for section roots). */
  exact?: boolean;
  roles?: Role[];
  badge?: "notifications";
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
  roles?: Role[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "main",
    label: "Main",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Contests", href: "/contests", icon: Trophy },
      { label: "Practice", href: "/practice", icon: Dumbbell },
      { label: "Leaderboard", href: "/leaderboard", icon: Medal },
      { label: "Submissions", href: "/submissions", icon: ListChecks },
    ],
  },
  {
    id: "personal",
    label: "Personal",
    items: [
      { label: "My Profile", href: "/profile", icon: User },
      { label: "Notifications", href: "/notifications", icon: Bell, badge: "notifications" },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    roles: ["cp_lead", "super_admin"],
    items: [
      { label: "Admin Overview", href: "/admin", icon: ShieldCheck, exact: true },
      { label: "Contests", href: "/admin/contests", icon: CalendarRange },
      { label: "Problems", href: "/admin/problems", icon: FileCode2 },
      { label: "Test Cases", href: "/admin/test-cases", icon: FlaskConical },
      { label: "Participants", href: "/admin/participants", icon: Users },
      { label: "Submissions", href: "/admin/submissions", icon: Gavel },
      { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
      { label: "User Management", href: "/admin/users", icon: UserCog, roles: ["super_admin"] },
    ],
  },
];

export function isActive(pathname: string, item: Pick<NavItem, "href" | "exact">) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function visibleSections(role: Role | undefined) {
  return NAV_SECTIONS.filter((s) => !s.roles || (role && s.roles.includes(role))).map((s) => ({
    ...s,
    items: s.items.filter((i) => !i.roles || (role && i.roles.includes(role))),
  }));
}

/** Human labels for static path segments, used by breadcrumbs and search. */
export const SEGMENT_LABEL: Record<string, string> = {
  dashboard: "Overview",
  contests: "Contests",
  practice: "Practice",
  problems: "Problems",
  leaderboard: "Leaderboard",
  submissions: "Submissions",
  profile: "My Profile",
  notifications: "Notifications",
  settings: "Settings",
  admin: "Admin",
  "test-cases": "Test Cases",
  participants: "Participants",
  announcements: "Announcements",
  "audit-logs": "Audit Logs",
  users: "User Management",
  new: "New",
  edit: "Edit",
};
