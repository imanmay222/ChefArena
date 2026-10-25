import type { AuditEvent } from "@/types";
import type { Timeline } from "./timeline";

export function seedAuditLogs(t: Timeline): AuditEvent[] {
  return [
    { id: "log-5", actorId: "u_lead", action: "announcement.publish", targetType: "announcement", targetId: "a-1", targetLabel: "Clarification · Plating Patterns", createdAt: t.contestMinute(t.c42Start, 18) },
    { id: "log-4", actorId: "u_lead", action: "contest.publish", targetType: "contest", targetId: "weekly-43", targetLabel: "ChefArena Weekly #43", createdAt: t.daysAgo(1) },
    { id: "log-3", actorId: "u_admin", action: "user.invite", targetType: "user", targetId: "u_arjun", targetLabel: "arjun_m", createdAt: t.daysAgo(2), detail: "Invited as member" },
    { id: "log-2", actorId: "u_lead", action: "testcase.update", targetType: "testcase", targetId: "CA106", targetLabel: "CA106 · Menu Tree", createdAt: t.daysAgo(3), detail: "Added 2 hidden tests" },
    { id: "log-1", actorId: "u_admin", action: "user.role_change", targetType: "user", targetId: "u_lead", targetLabel: "priya_r", createdAt: t.daysAgo(30), detail: "member → cp_lead" },
  ];
}
