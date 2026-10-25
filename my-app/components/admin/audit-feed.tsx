"use client";

import type { AuditAction, AuditEvent, UserSummary } from "@/types";
import { UserAvatar } from "@/components/ui/avatar";
import { fmtRelative } from "@/lib/utils/format";

export const AUDIT_LABEL: Record<AuditAction, string> = {
  "contest.create": "created contest",
  "contest.update": "updated contest",
  "contest.publish": "published contest",
  "contest.archive": "archived contest",
  "problem.create": "created problem",
  "problem.update": "updated problem",
  "testcase.update": "updated test cases for",
  "user.invite": "invited",
  "user.create": "created account",
  "user.role_change": "changed role of",
  "user.deactivate": "deactivated",
  "user.reactivate": "reactivated",
  "submission.rejudge": "rejudged",
  "announcement.publish": "published announcement",
  "announcement.update": "updated announcement",
  "announcement.delete": "deleted announcement",
};

export function AuditFeed({ events, users, now }: { events: AuditEvent[]; users: Map<string, UserSummary>; now: number | null }) {
  if (!events.length) return <p className="text-[13px] text-muted-foreground">No activity yet.</p>;
  return (
    <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-border">
      {events.map((e) => {
        const actor = users.get(e.actorId);
        return (
          <li key={e.id} className="relative flex gap-3">
            <UserAvatar name={actor?.name ?? e.actorId} seed={e.actorId} size="xs" className="relative mt-0.5 size-6 ring-4 ring-card" />
            <div className="min-w-0 text-[13px]">
              <p className="leading-snug">
                <span className="font-medium">{actor?.handle ?? e.actorId}</span> <span className="text-muted-foreground">{AUDIT_LABEL[e.action]}</span>{" "}
                <span className="font-medium">{e.targetLabel}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {e.detail ? `${e.detail} · ` : ""}
                {now ? fmtRelative(e.createdAt, now) : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
