"use client";

import { useState } from "react";
import { Dumbbell, FileQuestion, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProblem, useProblems } from "@/lib/queries";
import { ArenaHeader } from "./arena-header";
import { ArenaWorkspace } from "./arena-workspace";
import { ArenaMessage, ArenaSkeleton } from "./arena-states";

export function PracticeArena({ problemId }: { problemId: string }) {
  const problem = useProblem(problemId);
  const archive = useProblems();
  const [historySignal, setHistorySignal] = useState(0);

  if (problem.isPending) return <ArenaSkeleton />;
  if (!problem.data) {
    return <ArenaMessage icon={FileQuestion} title="Problem not found" description="It may have been removed or is not published yet." action="Back to practice" href="/practice" />;
  }
  if (problem.data.locked) {
    return (
      <ArenaMessage
        icon={Lock}
        title="Locked during a live contest"
        description={problem.data.lockReason}
        action="Open in contest arena"
        href={`/contests/${problem.data.problem.contestId}/problems/${problemId}`}
      />
    );
  }

  const items = (archive.data ?? [])
    .filter((p) => !p.locked)
    .map(({ problem: p, state }) => ({ id: p.id, code: p.id.replace(/^CA/, ""), title: p.title, state, href: `/problems/${p.id}` }));

  return (
    <>
      <ArenaHeader
        backHref="/practice"
        backLabel="Back to practice"
        title={`Practice · ${problem.data.problem.title}`}
        badge={
          <Badge variant="outline">
            <Dumbbell /> Unofficial
          </Badge>
        }
        items={items.length ? items : [{ id: problemId, code: problemId.replace(/^CA/, ""), title: problem.data.problem.title, state: problem.data.state, href: `/problems/${problemId}` }]}
        currentId={problemId}
        onOpenHistory={() => setHistorySignal((n) => n + 1)}
      />
      <ArenaWorkspace key={problemId} problem={problem.data.problem} contestId={null} editorial={problem.data.problem.editorial} historySignal={historySignal} />
    </>
  );
}
