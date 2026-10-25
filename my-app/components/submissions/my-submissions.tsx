"use client";

import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/feedback/states";
import { useContests, useProblems, useSubmissions } from "@/lib/queries";
import { SubmissionsTable } from "./submissions-table";

export function MySubmissions() {
  const submissions = useSubmissions();
  const problems = useProblems();
  const contests = useContests();
  const problemMap = new Map(problems.data?.map((p) => [p.problem.id, p.problem]));
  const contestMap = new Map(contests.data?.map((c) => [c.id, c]));

  return (
    <Card className="overflow-hidden">
      {submissions.isError ? (
        <ErrorState error={submissions.error} onRetry={() => submissions.refetch()} />
      ) : (
        <SubmissionsTable submissions={submissions.data} loading={submissions.isPending} problems={problemMap} contests={contestMap} />
      )}
    </Card>
  );
}
