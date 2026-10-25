"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { AdminProblem, Language, Problem, ProblemInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/feedback/states";
import { ProblemStatement } from "@/components/problems/problem-statement";
import { TestCaseEditor, newTestCase, toEditable } from "./test-case-editor";
import { useAdminProblem, useCreateProblem, useUpdateProblem } from "@/lib/queries";
import { lines, problemSchema, type ProblemFormOutput, type ProblemFormValues } from "@/lib/validation/problem";
import { LANGUAGES, LANGUAGE_ORDER, STARTER_CODE } from "@/lib/editor/languages";
import { TOPICS, TOPIC_LABEL } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const paragraphs = (v: string) =>
  v
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);


function toValues(p: AdminProblem | null): ProblemFormValues {
  return {
    id: p?.id ?? "",
    code: p?.code ?? "",
    title: p?.title ?? "",
    statement: p?.statement.join("\n\n") ?? "",
    inputFormat: p?.inputFormat.join("\n") ?? "",
    outputFormat: p?.outputFormat.join("\n") ?? "",
    constraints: p?.constraints.join("\n") ?? "",
    difficulty: p?.difficulty ?? "easy",
    points: p?.points ?? 100,
    timeLimitMs: p?.timeLimitMs ?? 1000,
    memoryLimitMb: p?.memoryLimitMb ?? 256,
    languages: p?.languages ?? ["cpp", "java", "python", "go"],
    topics: p?.topics ?? [],
    contestId: p?.contestId ?? null,
    published: p?.published ?? false,
    testCases: p?.testCases.map(toEditable) ?? [newTestCase("sample", 1)],
    referenceLanguage: p?.referenceSolution.language ?? "cpp",
    referenceSource: p?.referenceSolution.source ?? STARTER_CODE.cpp,
    editorial: p?.editorial ?? "",
  };
}

function toInput(v: ProblemFormOutput, author: string): ProblemInput {
  return {
    id: v.id,
    code: v.code,
    title: v.title,
    difficulty: v.difficulty,
    points: v.points,
    topics: v.topics,
    statement: paragraphs(v.statement),
    inputFormat: lines(v.inputFormat),
    outputFormat: lines(v.outputFormat),
    constraints: lines(v.constraints),
    timeLimitMs: v.timeLimitMs,
    memoryLimitMb: v.memoryLimitMb,
    languages: v.languages,
    contestId: v.contestId,
    author,
    published: v.published,
    testCases: v.testCases.map((tc) => ({ ...tc, problemId: v.id })),
    referenceSolution: { language: v.referenceLanguage, source: v.referenceSource },
    editorial: v.editorial,
  };
}

function previewProblem(v: ProblemFormValues, existing: AdminProblem | null): Problem {
  return {
    id: v.id || "CA???",
    code: v.code ?? "",
    title: v.title || "Untitled problem",
    difficulty: v.difficulty,
    points: Number(v.points) || 0,
    topics: v.topics,
    statement: paragraphs(v.statement),
    inputFormat: lines(v.inputFormat),
    outputFormat: lines(v.outputFormat),
    constraints: lines(v.constraints),
    samples: v.testCases.filter((t) => t.kind === "sample").map((t) => ({ id: t.id, input: t.input, output: t.output, explanation: t.explanation })),
    timeLimitMs: Number(v.timeLimitMs) || 0,
    memoryLimitMb: Number(v.memoryLimitMb) || 0,
    languages: v.languages,
    contestId: v.contestId,
    author: "",
    solvedCount: existing?.solvedCount ?? 0,
    attemptCount: existing?.attemptCount ?? 0,
    published: v.published,
  };
}

/** Which tab holds the first error, so validation failures are never hidden. */
function tabForErrors(errors: FieldErrors<ProblemFormValues>): string | null {
  if (errors.id || errors.title || errors.statement || errors.inputFormat || errors.outputFormat || errors.constraints || errors.topics) return "statement";
  if (errors.points || errors.timeLimitMs || errors.memoryLimitMb || errors.languages) return "limits";
  if (errors.testCases) return "tests";
  return null;
}

export function ProblemFormPage({ problemId }: { problemId?: string }) {
  const existing = useAdminProblem(problemId ?? "");
  if (problemId && existing.isPending) return <Skeleton className="h-[640px] rounded-xl" />;
  if (problemId && !existing.data) {
    return (
      <Card>
        <EmptyState title="Problem not found" action={<Button variant="outline" size="sm" asChild><Link href="/admin/problems">Back to problems</Link></Button>} />
      </Card>
    );
  }
  return <ProblemForm problem={existing.data ?? null} key={problemId ?? "new"} />;
}

function ProblemForm({ problem }: { problem: AdminProblem | null }) {
  const router = useRouter();
  const create = useCreateProblem();
  const update = useUpdateProblem();
  const [tab, setTab] = useState("statement");
  const [showPreview, setShowPreview] = useState(false);
  const form = useForm<ProblemFormValues, unknown, ProblemFormOutput>({ resolver: zodResolver(problemSchema), defaultValues: toValues(problem), mode: "onTouched" });
  const { register, control, handleSubmit, formState } = form;
  const errors = formState.errors;
  // Every field has a default value, so the watched snapshot is complete.
  const values = useWatch({ control }) as ProblemFormValues;
  const busy = create.isPending || update.isPending;

  const onSubmit = handleSubmit(
    async (v) => {
      try {
        const input = toInput(v, problem?.author ?? "u_lead");
        const saved = problem ? await update.mutateAsync({ id: problem.id, input }) : await create.mutateAsync(input);
        toast.success(`${saved.id} · ${saved.title} saved`);
        router.push("/admin/problems");
      } catch {
        /* surfaced by the mutation hook */
      }
    },
    (errs) => {
      const target = tabForErrors(errs);
      if (target) setTab(target);
      toast.error("Please fix the highlighted fields");
    },
  );

  const preview = (
    <Card className="min-w-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <p className="text-[13px] font-semibold">Live preview</p>
        <span className="text-[11px] text-muted-foreground">As members will see it</span>
      </div>
      <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto p-5 scrollbar-thin">
        <ProblemStatement problem={previewProblem(values, problem)} />
      </div>
    </Card>
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/problems" className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Problems
          </Link>
          <h1 className="text-xl font-semibold tracking-tight sm:text-[22px]">{problem ? `Edit ${problem.id}` : "New problem"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Statements support `inline code` and **bold**. Separate paragraphs with a blank line.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="xl:hidden" onClick={() => setShowPreview((v) => !v)} aria-pressed={showPreview}>
            <Eye /> {showPreview ? "Hide preview" : "Preview"}
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Save />} Save problem
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div className="min-w-0">
          {showPreview && <div className="mb-4 xl:hidden">{preview}</div>}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4 w-full justify-start overflow-x-auto sm:w-fit">
              <TabsTrigger value="statement">Statement</TabsTrigger>
              <TabsTrigger value="limits">Limits & languages</TabsTrigger>
              <TabsTrigger value="tests">
                Test cases <span className="font-mono text-[10px] text-muted-foreground">{values.testCases.length}</span>
              </TabsTrigger>
              <TabsTrigger value="solution">Solution & editorial</TabsTrigger>
            </TabsList>

            <TabsContent value="statement">
              <Card>
                <CardContent className="grid gap-4 pt-5">
                  <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                    <Field id="pid" label="Problem ID" required error={errors.id?.message} hint={problem ? "IDs can't change after creation." : undefined}>
                      <Input placeholder="CA107" className="font-mono uppercase" disabled={!!problem} {...register("id")} />
                    </Field>
                    <Field id="ptitle" label="Title" required error={errors.title?.message}>
                      <Input placeholder="Saffron Sequences" {...register("title")} />
                    </Field>
                  </div>
                  <Field id="statement" label="Statement" required error={errors.statement?.message}>
                    <Textarea rows={7} {...register("statement")} />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field id="inputFormat" label="Input format" required hint="One line per sentence." error={errors.inputFormat?.message}>
                      <Textarea rows={4} {...register("inputFormat")} />
                    </Field>
                    <Field id="outputFormat" label="Output format" required error={errors.outputFormat?.message}>
                      <Textarea rows={4} {...register("outputFormat")} />
                    </Field>
                  </div>
                  <Field id="constraints" label="Constraints" required hint="One constraint per line." error={errors.constraints?.message}>
                    <Textarea rows={3} className="font-mono text-xs" {...register("constraints")} />
                  </Field>
                  <Controller
                    control={control}
                    name="topics"
                    render={({ field }) => (
                      <div className="grid gap-1.5">
                        <Label>Topics</Label>
                        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Topics">
                          {TOPICS.map((t) => {
                            const on = field.value.includes(t);
                            return (
                              <button
                                key={t}
                                type="button"
                                aria-pressed={on}
                                onClick={() => field.onChange(on ? field.value.filter((x) => x !== t) : [...field.value, t])}
                                className={cn(
                                  "cursor-pointer rounded-md border px-2 py-1 text-xs transition-colors",
                                  on ? "border-primary bg-primary-soft text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                                )}
                              >
                                {TOPIC_LABEL[t]}
                              </button>
                            );
                          })}
                        </div>
                        {errors.topics && <p className="text-xs text-destructive">{errors.topics.message}</p>}
                      </div>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="limits">
              <Card>
                <CardContent className="grid gap-4 pt-5">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Controller
                      control={control}
                      name="difficulty"
                      render={({ field }) => (
                        <div className="grid gap-1.5">
                          <Label htmlFor="difficulty">Difficulty</Label>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="difficulty" className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />
                    <Field id="points" label="Points" error={errors.points?.message}>
                      <Input type="number" step={50} {...register("points", { valueAsNumber: true })} />
                    </Field>
                    <Field id="timeLimitMs" label="Time limit (ms)" error={errors.timeLimitMs?.message}>
                      <Input type="number" step={250} {...register("timeLimitMs", { valueAsNumber: true })} />
                    </Field>
                    <Field id="memoryLimitMb" label="Memory (MB)" error={errors.memoryLimitMb?.message}>
                      <Input type="number" step={64} {...register("memoryLimitMb", { valueAsNumber: true })} />
                    </Field>
                  </div>
                  <Controller
                    control={control}
                    name="languages"
                    render={({ field }) => (
                      <div className="grid gap-1.5">
                        <Label>Supported languages</Label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {LANGUAGE_ORDER.map((l) => {
                            const on = field.value.includes(l);
                            return (
                              <label key={l} className={cn("flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2", on ? "border-primary/50 bg-primary-soft" : "border-border")}>
                                <span>
                                  <span className="block text-[13px] font-medium">{LANGUAGES[l].label}</span>
                                  <span className="block text-[11px] text-muted-foreground">{LANGUAGES[l].version}</span>
                                </span>
                                <Switch checked={on} onCheckedChange={(v) => field.onChange(v ? [...field.value, l] : field.value.filter((x) => x !== l))} aria-label={`Allow ${LANGUAGES[l].label}`} />
                              </label>
                            );
                          })}
                        </div>
                        {errors.languages && <p className="text-xs text-destructive">{errors.languages.message}</p>}
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="published"
                    render={({ field }) => (
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                        <div>
                          <Label htmlFor="published">Published</Label>
                          <p className="mt-0.5 text-xs text-muted-foreground">Unpublished problems are hidden from members even after their contest ends.</p>
                        </div>
                        <Switch id="published" checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tests">
              <Card>
                <CardContent className="pt-5">
                  <Controller
                    control={control}
                    name="testCases"
                    render={({ field }) => <TestCaseEditor cases={field.value} onChange={field.onChange} error={errors.testCases?.message ?? errors.testCases?.root?.message} />}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="solution">
              <Card>
                <CardContent className="grid gap-4 pt-5">
                  <Controller
                    control={control}
                    name="referenceLanguage"
                    render={({ field }) => (
                      <div className="grid gap-1.5 sm:w-48">
                        <Label htmlFor="refLang">Reference solution language</Label>
                        <Select value={field.value} onValueChange={(v) => field.onChange(v as Language)}>
                          <SelectTrigger id="refLang" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGE_ORDER.map((l) => (
                              <SelectItem key={l} value={l}>
                                {LANGUAGES[l].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                  <Field id="referenceSource" label="Reference solution" hint="Admin-only. Used to generate expected outputs once the judge is connected.">
                    <Textarea rows={12} className="font-mono text-xs" spellCheck={false} {...register("referenceSource")} />
                  </Field>
                  <Field id="editorial" label="Editorial" hint="Shown to members after the contest ends.">
                    <Textarea rows={5} {...register("editorial")} />
                  </Field>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="hidden min-w-0 xl:block">
          <div className="sticky top-20">{preview}</div>
        </div>
      </div>
    </form>
  );
}
