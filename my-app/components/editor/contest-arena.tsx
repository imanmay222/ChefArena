"use client";

import { useState } from "react";
import { Clock, FileQuestion, Info } from "lucide-react";
import { useContest, useContestProblems } from "@/lib/queries";
import { useNow } from "@/hooks/use-now";
import { contestEndMs, getContestStatus } from "@/lib/contests/status";
import { ContestStatusBadge } from "@/components/ui/status-badges";
import { Countdown } from "@/components/contests/countdown";
import { ArenaHeader } from "./arena-header";
import { ArenaWorkspace } from "./arena-workspace";
import { ArenaMessage, ArenaSkeleton } from "./arena-states";

export function ContestArena({ contestId, problemId }: { contestId: string; problemId: string }) {
  const now = useNow(1000);
  const contest = useContest(contestId);
  const status = contest.data && now ? getContestStatus(contest.data, now) : null;
  const started = status === "ongoing" || status === "ended" || status === "archived";
  const problems = useContestProblems(contestId, started);
  const [historySignal, setHistorySignal] = useState(0);

  if (contest.isPending || now === null) return <ArenaSkeleton />;
  if (!contest.data) {
    return (
      <ArenaMessage icon={FileQuestion} title="Contest not found" description="This contest does not exist or is not visible to you." action="Browse contests" href="/contests" />
    );
  }
  if (!started) {
    return (
      <ArenaMessage
        icon={Clock}
        title={`${contest.data.title} hasn't started`}
        description={
          <div className="flex flex-col items-center gap-3">
            <span>Problems unlock when the contest begins.</span>
            <Countdown target={contest.data.startsAt} variant="blocks" />
          </div>
        }
        action="View contest details"
        href={`/contests/${contestId}`}
      />
    );
  }
  if (problems.isPending) return <ArenaSkeleton />;

  const items = (problems.data ?? []).map(({ problem, state }) => ({
    id: problem.id,
    code: problem.code,
    title: problem.title,
    state,
    href: `/contests/${contestId}/problems/${problem.id}`,
  }));
  const current = problems.data?.find((p) => p.problem.id === problemId);

  if (!current) {
    return (
      <ArenaMessage
        icon={FileQuestion}
        title="Problem not in this contest"
        description="Pick a problem from the contest page."
        action="Back to contest"
        href={`/contests/${contestId}`}
      />
    );
  }

  const live = status === "ongoing";
  const notice = !live ? (
    <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-info/30 bg-info/8 px-3 py-2.5 text-[13px]">
      <Info className="mt-px size-4 shrink-0 text-info" />
      <p>
        This contest has ended. New submissions are <span className="font-medium">practice submissions</span> and do not change the final standings.
      </p>
    </div>
  ) : null;

  return (
    <>
      <ArenaHeader
        backHref={`/contests/${contestId}`}
        backLabel="Back to contest"
        title={contest.data.shortTitle}
        badge={<ContestStatusBadge status={status!} />}
        endsAt={live ? contestEndMs(contest.data) : undefined}
        items={items}
        currentId={problemId}
        onOpenHistory={() => setHistorySignal((n) => n + 1)}
      />
      <ArenaWorkspace
        key={problemId}
        problem={current.problem}
        contestId={live ? contestId : null}
        notice={notice}
        editorial={!live ? current.problem.editorial : undefined}
        historySignal={historySignal}
      />
    </>
  );
}
