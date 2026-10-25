"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, FlaskConical, Loader2, Save, ShieldCheck, XCircle } from "lucide-react";
import type { AdminProblem, TestCaseValidationReport } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { DifficultyLabel } from "@/components/ui/status-badges";
import { CodeBlock } from "@/components/problems/sample-block";
import { TestCaseEditor, toEditable, type EditableTestCase } from "./test-case-editor";
import { useAdminProblems, useSaveTestCases, useValidateTestCases } from "@/lib/queries";
import { cn } from "@/lib/utils/cn";

function Editor({ problem }: { problem: AdminProblem }) {
  const [cases, setCases] = useState<EditableTestCase[]>(() => problem.testCases.map(toEditable));
  const [report, setReport] = useState<TestCaseValidationReport | null>(null);
  const save = useSaveTestCases();
  const validate = useValidateTestCases();
  const dirty = JSON.stringify(cases) !== JSON.stringify(problem.testCases.map(toEditable));
  const samples = cases.filter((c) => c.kind === "sample");
  const incomplete = cases.some((c) => !c.input.trim() || !c.output.trim());

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="min-w-0">
        <CardHeader>
          <div>
            <CardTitle>
              <span className="mr-2 font-mono text-muted-foreground">{problem.id}</span>
              {problem.title}
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <DifficultyLabel difficulty={problem.difficulty} /> · {problem.timeLimitMs} ms · {problem.memoryLimitMb} MB
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={validate.isPending || dirty}
              title={dirty ? "Save changes before validating" : undefined}
              onClick={() => validate.mutate(problem.id, { onSuccess: setReport })}
            >
              {validate.isPending ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Validate
            </Button>
            <Button
              size="sm"
              disabled={!dirty || save.isPending || incomplete}
              onClick={() => save.mutate({ problemId: problem.id, cases: cases.map((c) => ({ ...c, problemId: problem.id })) }, { onSuccess: () => setReport(null) })}
            >
              {save.isPending ? <Loader2 className="animate-spin" /> : <Save />} Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {incomplete && <p className="mb-2 text-xs text-warning">Every case needs both an input and an expected output before saving.</p>}
          <TestCaseEditor cases={cases} onChange={setCases} />
        </CardContent>
      </Card>

      <div className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="size-4 text-muted-foreground" /> Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[13px]">
            {!report ? (
              <p className="text-muted-foreground">Run validation to check for empty files, trailing whitespace, duplicates and missing samples. {dirty && "Save your changes first."}</p>
            ) : (
              <div>
                <p className={cn("flex items-center gap-2 font-medium", report.ok ? "text-success" : "text-destructive")}>
                  {report.ok ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                  {report.ok ? "Ready to judge" : "Fix errors before the contest"} · {report.checked} cases
                </p>
                {report.issues.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {report.issues.map((i, n) => (
                      <li key={n} className="flex gap-2 text-xs">
                        {i.level === "error" ? <XCircle className="mt-px size-3.5 shrink-0 text-destructive" /> : <AlertTriangle className="mt-px size-3.5 shrink-0 text-warning" />}
                        {i.message}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-[11px] text-muted-foreground">Simulated check — the reference solution was not executed.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Public sample preview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {samples.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No public samples. Members will only see the statement.</p>
            ) : (
              samples.map((s, i) => (
                <div key={s.id} className="grid gap-2">
                  <p className="text-xs font-medium">Sample {i + 1}</p>
                  <CodeBlock label="Input" value={s.input || " "} />
                  <CodeBlock label="Output" value={s.output || " "} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function TestCaseManager({ initialProblemId }: { initialProblemId?: string }) {
  const problems = useAdminProblems();
  const [selected, setSelected] = useState(initialProblemId);
  const problem = problems.data?.find((p) => p.id === selected) ?? problems.data?.[0];

  return (
    <>
      <PageHeader
        title="Test cases"
        description="Public samples are shown in statements; hidden tests are only used by the judge."
        actions={
          problems.data && (
            <Select value={problem?.id} onValueChange={setSelected}>
              <SelectTrigger className="w-64" aria-label="Problem">
                <SelectValue placeholder="Choose a problem" />
              </SelectTrigger>
              <SelectContent>
                {problems.data.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.id} · {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }
      />
      {problem ? <Editor key={`${problem.id}-${problem.testCases.map((t) => t.id).join()}`} problem={problem} /> : <Skeleton className="h-96 rounded-xl" />}
    </>
  );
}
