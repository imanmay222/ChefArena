"use client";

import Link from "next/link";
import type { Problem, Submission } from "@/types";
import { VerdictBadge } from "@/components/ui/status-badges";
import { useNow } from "@/hooks/use-now";
import { LANGUAGES } from "@/lib/editor/languages";
import { fmtRelative, fmtRuntime } from "@/lib/utils/format";

/** Compact list used on the dashboard and in the arena. */
export function SubmissionList({
  submissions,
  problems,
  onSelect,
}: {
  submissions: Submission[];
  problems?: Map<string, Problem>;
  onSelect?: (s: Submission) => void;
}) {
  const now = useNow(30_000);
  return (
    <ul className="divide-y divide-border">
      {submissions.map((s) => {
        const problem = problems?.get(s.problemId);
        const href = s.kind === "contest" && s.contestId ? `/contests/${s.contestId}/problems/${s.problemId}` : `/problems/${s.problemId}`;
        const inner = (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">
                <span className="mr-1.5 font-mono text-xs text-muted-foreground">{s.problemId}</span>
                {problem?.title ?? ""}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {LANGUAGES[s.language].label} · {fmtRuntime(s.timeMs)} · {s.kind === "practice" ? "Practice" : "Contest"} · {now ? fmtRelative(s.createdAt, now) : ""}
              </p>
            </div>
            <VerdictBadge verdict={s.verdict} status={s.status} short />
          </>
        );
        return (
          <li key={s.id}>
            {onSelect ? (
              <button onClick={() => onSelect(s)} className="-mx-2 flex w-[calc(100%+1rem)] cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-accent/60">
                {inner}
              </button>
            ) : (
              <Link href={href} className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-accent/60">
                {inner}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
