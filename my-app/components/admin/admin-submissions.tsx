"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import type { Submission, Verdict } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/feedback/states";
import { SubmissionsTable } from "@/components/submissions/submissions-table";
import { useAdminContests, useAdminProblems, useAdminSubmissions, useAdminUsers, useRejudge } from "@/lib/queries";
import { VERDICT_META } from "@/lib/utils/format";

export function AdminSubmissions() {
  const submissions = useAdminSubmissions();
  const problems = useAdminProblems();
  const contests = useAdminContests();
  const users = useAdminUsers();
  const rejudge = useRejudge();
  const [target, setTarget] = useState<Submission | null>(null);
  const [outcome, setOutcome] = useState<Verdict | "keep">("keep");

  const hasPending = submissions.data?.some((s) => s.status !== "completed");

  return (
    <>
      <PageHeader title="All submissions" description="Every judged submission across contests and practice. Rejudging here is simulated." />
      <Card className="overflow-hidden">
        {submissions.isError ? (
          <ErrorState error={submissions.error} onRetry={() => submissions.refetch()} />
        ) : (
          <SubmissionsTable
            submissions={submissions.data}
            loading={submissions.isPending}
            problems={new Map(problems.data?.map((p) => [p.id, p]))}
            contests={new Map(contests.data?.map((c) => [c.id, c]))}
            users={new Map(users.data?.map((u) => [u.id, u]))}
            rowActions={(s) => (
              <Button
                variant="ghost"
                size="xs"
                disabled={s.status !== "completed"}
                onClick={() => {
                  setOutcome("keep");
                  setTarget(s);
                }}
              >
                <RotateCw /> Rejudge
              </Button>
            )}
          />
        )}
      </Card>
      {hasPending && <RefreshWhileJudging onTick={submissions.refetch} />}

      <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejudge {target?.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              The submission is re-queued and its verdict recalculated. If it belongs to a live or finished contest, standings update automatically. This mock only simulates the judge.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="rejudge-outcome">Simulated outcome</Label>
            <Select value={outcome} onValueChange={(v) => setOutcome(v as Verdict | "keep")}>
              <SelectTrigger id="rejudge-outcome" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keep">Same as before ({target?.verdict ? VERDICT_META[target.verdict].label : "—"})</SelectItem>
                {(Object.keys(VERDICT_META) as Verdict[]).map((v) => (
                  <SelectItem key={v} value={v}>
                    {VERDICT_META[v].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => target && rejudge.mutate({ id: target.id, outcome })}>Rejudge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


/** Polls while a rejudge is in flight so the table reflects the final verdict. */
function RefreshWhileJudging({ onTick }: { onTick: () => void }) {
  useEffect(() => {
    const id = setInterval(onTick, 1000);
    return () => clearInterval(id);
  }, [onTick]);
  return null;
}
