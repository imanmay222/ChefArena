"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, CircleDashed, FlaskConical, Loader2, Terminal, X } from "lucide-react";
import type { Problem, RunResult, Submission, Verdict } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CodeBlock } from "@/components/problems/sample-block";
import { SubmissionList } from "@/components/submissions/submission-list";
import { SourceDialog } from "@/components/submissions/source-dialog";
import { EmptyState } from "@/components/feedback/states";
import { useSubmissions } from "@/lib/queries";
import { VERDICT_META, fmtMemory, fmtRuntime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export type ResultsTab = "tests" | "result" | "submissions";
export type SimulatedOutcome = Verdict | "auto";

interface ResultsPanelProps {
  problem: Problem;
  tab: ResultsTab;
  onTabChange: (tab: ResultsTab) => void;
  running: boolean;
  runResult: RunResult | null;
  runError: string | null;
  submission: Submission | null;
  outcome: SimulatedOutcome;
  onOutcomeChange: (o: SimulatedOutcome) => void;
  headerAction?: React.ReactNode;
}

const STEPS = [
  { id: "queued", label: "Queued" },
  { id: "compiling", label: "Compiling" },
  { id: "running", label: "Running" },
  { id: "completed", label: "Verdict" },
] as const;

function JudgeStepper({ submission }: { submission: Submission }) {
  const index = STEPS.findIndex((s) => s.id === submission.status);
  const total = submission.totalTests ?? 0;
  const passed = submission.passedTests ?? 0;
  return (
    <div>
      <ol className="flex items-center gap-2" aria-label="Judging progress">
        {STEPS.map((step, i) => {
          const done = i < index || submission.status === "completed";
          const active = i === index && submission.status !== "completed";
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                  done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3" strokeWidth={3} /> : active ? <Loader2 className="size-3 animate-spin" /> : i + 1}
              </span>
              <span className={cn("text-xs whitespace-nowrap", active || done ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
              {i < STEPS.length - 1 && <span className={cn("h-px flex-1", done ? "bg-primary/60" : "bg-border")} />}
            </li>
          );
        })}
      </ol>
      {submission.status === "running" && total > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Running test {Math.min(passed + 1, total)} of {total}</span>
            <span className="font-mono tabular">
              {passed}/{total}
            </span>
          </div>
          <Progress value={(passed / total) * 100} />
        </div>
      )}
    </div>
  );
}

function VerdictCard({ submission }: { submission: Submission }) {
  if (!submission.verdict) return null;
  const meta = VERDICT_META[submission.verdict];
  const toneText = { success: "text-success", destructive: "text-destructive", warning: "text-warning", info: "text-info" }[meta.tone];
  const toneBg = { success: "bg-success/8 border-success/25", destructive: "bg-destructive/8 border-destructive/25", warning: "bg-warning/8 border-warning/25", info: "bg-info/8 border-info/25" }[meta.tone];
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={cn("rounded-lg border p-4", toneBg)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className={cn("text-lg font-semibold tracking-tight", toneText)}>{meta.label}</p>
        <span className="font-mono text-xs text-muted-foreground">{submission.id}</span>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">
        {submission.verdict === "accepted"
          ? `All ${submission.totalTests} tests passed.`
          : submission.verdict === "compilation_error"
            ? "Your code did not compile."
            : `Failed on test ${submission.failedTest} of ${submission.totalTests}.`}{" "}
        {submission.kind === "practice" ? "Practice submission — does not affect contest standings." : `Official submission at minute ${submission.contestMinute}.`}
      </p>
      {submission.verdict !== "compilation_error" && (
        <dl className="mt-3 grid grid-cols-3 gap-3 text-xs">
          <div>
            <dt className="text-muted-foreground">Time</dt>
            <dd className="mt-0.5 font-mono text-sm text-foreground">{fmtRuntime(submission.timeMs)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Memory</dt>
            <dd className="mt-0.5 font-mono text-sm text-foreground">{fmtMemory(submission.memoryKb)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tests</dt>
            <dd className="mt-0.5 font-mono text-sm text-foreground">
              {submission.passedTests}/{submission.totalTests}
            </dd>
          </div>
        </dl>
      )}
      {submission.compileOutput && <pre className="mt-3 overflow-x-auto rounded-md bg-background/60 p-2.5 font-mono text-xs text-destructive">{submission.compileOutput}</pre>}
    </motion.div>
  );
}

function RunResultView({ result }: { result: RunResult }) {
  const [selected, setSelected] = useState(0);
  if (result.status === "compilation_error") {
    return (
      <div>
        <p className="mb-2 text-sm font-semibold text-info">Compilation error</p>
        <pre className="overflow-x-auto rounded-lg border border-info/30 bg-info/5 p-3 font-mono text-xs">{result.compileOutput}</pre>
      </div>
    );
  }
  const passed = result.cases.filter((c) => c.passed).length;
  const current = result.cases[Math.min(selected, result.cases.length - 1)];
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <p className={cn("text-sm font-semibold", passed === result.cases.length ? "text-success" : "text-destructive")}>
          {passed === result.cases.length ? "Sample tests passed" : "Sample tests failed"}
        </p>
        <span className="text-xs text-muted-foreground">
          {passed}/{result.cases.length} passed · samples only
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Sample cases">
        {result.cases.map((c, i) => (
          <button
            key={c.sampleId}
            role="tab"
            aria-selected={i === selected}
            onClick={() => setSelected(i)}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors",
              i === selected ? "border-border-strong bg-accent text-foreground" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {c.passed ? <Check className="size-3 text-success" /> : <X className="size-3 text-destructive" />}
            Case {i + 1}
          </button>
        ))}
      </div>
      {current && (
        <div className="grid gap-2">
          <CodeBlock label="Input" value={current.input} />
          <div className="grid gap-2 sm:grid-cols-2">
            <CodeBlock label="Expected output" value={current.expected} />
            <CodeBlock label="Your output" value={current.actual || "(no output)"} className={current.passed ? "" : "border-destructive/40"} />
          </div>
          <p className="text-[11px] text-muted-foreground">Runtime {current.timeMs} ms (estimated)</p>
        </div>
      )}
    </div>
  );
}

export function ResultsPanel({ problem, tab, onTabChange, running, runResult, runError, submission, outcome, onOutcomeChange, headerAction }: ResultsPanelProps) {
  const [testIndex, setTestIndex] = useState(0);
  const [viewing, setViewing] = useState<Submission | null>(null);
  const history = useSubmissions({ problemId: problem.id });
  const sample = problem.samples[Math.min(testIndex, problem.samples.length - 1)];

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-2">
        <Tabs value={tab} onValueChange={(v) => onTabChange(v as ResultsTab)} className="min-w-0">
          <TabsList className="h-8 border-0 bg-transparent">
            <TabsTrigger value="tests" className="text-xs">
              <FlaskConical /> Test cases
            </TabsTrigger>
            <TabsTrigger value="result" className="text-xs">
              <Terminal /> Result
              {(running || (submission && submission.status !== "completed")) && <Loader2 className="animate-spin text-primary" />}
            </TabsTrigger>
            <TabsTrigger value="submissions" className="text-xs">
              Submissions
              {history.data && history.data.length > 0 && <span className="font-mono text-[10px] text-muted-foreground">{history.data.length}</span>}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="xs" className="text-[11px]" aria-label="Simulated outcome">
                <span className="hidden sm:inline">Simulate:</span> {outcome === "auto" ? "Auto" : VERDICT_META[outcome].short} <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="leading-snug font-normal">
                Mock judge only. &ldquo;Auto&rdquo; uses simple heuristics; choose a verdict to preview other states.
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={outcome} onValueChange={(v) => onOutcomeChange(v as SimulatedOutcome)}>
                <DropdownMenuRadioItem value="auto">Auto (heuristic)</DropdownMenuRadioItem>
                {(Object.keys(VERDICT_META) as Verdict[]).map((v) => (
                  <DropdownMenuRadioItem key={v} value={v}>
                    {VERDICT_META[v].label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {headerAction}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thin">
        {tab === "tests" &&
          (sample ? (
            <div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {problem.samples.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setTestIndex(i)}
                    className={cn(
                      "cursor-pointer rounded-md border px-2.5 py-1 text-xs transition-colors",
                      i === testIndex ? "border-border-strong bg-accent text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Case {i + 1}
                  </button>
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <CodeBlock label="Input" value={sample.input} />
                <CodeBlock label="Expected output" value={sample.output} />
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">Run executes these public samples. Submit judges against all tests, including hidden ones.</p>
            </div>
          ) : (
            <EmptyState title="No public samples" className="py-6" />
          ))}

        {tab === "result" && (
          <AnimatePresence mode="wait" initial={false}>
            {submission ? (
              <motion.div key={`sub-${submission.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4">
                <JudgeStepper submission={submission} />
                {submission.status === "completed" && <VerdictCard submission={submission} />}
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <FlaskConical className="size-3" /> Simulated verdict — your code was not executed. Judge0 will run it once the backend is connected.
                </p>
              </motion.div>
            ) : running ? (
              <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-primary" /> Running sample tests…
              </motion.div>
            ) : runError ? (
              <motion.p key="error" className="text-sm text-destructive">
                {runError}
              </motion.p>
            ) : runResult ? (
              <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RunResultView result={runResult} />
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <FlaskConical className="size-3" /> Simulated run — outputs are produced by the mock judge, not by executing your code.
                </p>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EmptyState icon={CircleDashed} title="Nothing run yet" description="Use Run to check the samples, or Submit for a full verdict." className="py-6" />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {tab === "submissions" &&
          (history.data ? (
            history.data.length ? (
              <SubmissionList submissions={history.data} onSelect={setViewing} />
            ) : (
              <EmptyState title="No submissions for this problem" className="py-6" />
            )
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading…
            </div>
          ))}
      </div>
      <SourceDialog submission={viewing} problemTitle={problem.title} onOpenChange={(o) => !o && setViewing(null)} />
    </div>
  );
}

