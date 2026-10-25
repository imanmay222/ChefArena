"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, setHours, setMinutes, startOfMinute } from "date-fns";
import { AlertTriangle, Archive, ArchiveRestore, ArrowLeft, Eye, Loader2, Rocket, Save } from "lucide-react";
import type { Contest, ContestInput, ContestLifecycle } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { ContestStatusBadge, DifficultyLabel } from "@/components/ui/status-badges";
import { EmptyState } from "@/components/feedback/states";
import { ContestPreviewDialog } from "./contest-preview-dialog";
import { useAdminContest, useAdminProblems, useCreateAnnouncement, useCreateContest, useSetContestLifecycle, useUpdateContest } from "@/lib/queries";
import { contestSchema, publishIssues, type ContestFormValues } from "@/lib/validation/contest";
import { DEFAULT_SCORING } from "@/lib/mock-data/contests";
import { getContestStatus } from "@/lib/contests/status";
import { fmtDateTime, fmtDuration } from "@/lib/utils/format";
import { useNow } from "@/hooks/use-now";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

const DEFAULT_RULES = [
  "Individual participation only.",
  "ICPC ranking: problems solved, then total penalty.",
  "20 penalty minutes per rejected attempt before the first accepted one.",
];

const toLocalInput = (iso: string) => format(new Date(iso), "yyyy-MM-dd'T'HH:mm");

function toValues(contest: Contest | null): ContestFormValues {
  const nextWeek = startOfMinute(setMinutes(setHours(addDays(new Date(), 7), 19), 0));
  return {
    title: contest?.title ?? "",
    shortTitle: contest?.shortTitle ?? "",
    description: contest?.description ?? "",
    startsAt: toLocalInput(contest?.startsAt ?? nextWeek.toISOString()),
    durationMinutes: contest?.durationMinutes ?? 150,
    problemIds: contest?.problemIds ?? [],
    penaltyMinutes: contest?.scoring.penaltyMinutes ?? DEFAULT_SCORING.penaltyMinutes,
    penalizeCompilationError: contest?.scoring.penalizeCompilationError ?? false,
    freezeMinutes: contest?.scoring.freezeMinutes ?? 0,
    visibility: contest?.visibility ?? "department",
    rules: (contest?.rules ?? DEFAULT_RULES).join("\n"),
    announcement: "",
  };
}

function toInput(values: ContestFormValues, lifecycle: ContestLifecycle): ContestInput {
  return {
    title: values.title,
    shortTitle: values.shortTitle,
    description: values.description,
    startsAt: new Date(values.startsAt).toISOString(),
    durationMinutes: values.durationMinutes,
    problemIds: values.problemIds,
    scoring: { format: "ICPC", penaltyMinutes: values.penaltyMinutes, penalizeCompilationError: values.penalizeCompilationError, freezeMinutes: values.freezeMinutes },
    visibility: values.visibility,
    lifecycle,
    rules: values.rules
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean),
  };
}

export function ContestFormPage({ contestId }: { contestId?: string }) {
  const existing = useAdminContest(contestId ?? "");
  if (contestId && existing.isPending) return <Skeleton className="h-[600px] rounded-xl" />;
  if (contestId && !existing.data) {
    return (
      <Card>
        <EmptyState title="Contest not found" action={<Button variant="outline" size="sm" asChild><Link href="/admin/contests">Back to contests</Link></Button>} />
      </Card>
    );
  }
  return <ContestForm contest={existing.data ?? null} key={existing.data?.updatedAt ?? "new"} />;
}

function ContestForm({ contest }: { contest: Contest | null }) {
  const router = useRouter();
  const now = useNow(30_000);
  const problems = useAdminProblems();
  const create = useCreateContest();
  const update = useUpdateContest();
  const lifecycle = useSetContestLifecycle();
  const announce = useCreateAnnouncement();
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<Contest | null>(null);

  const form = useForm<ContestFormValues>({ resolver: zodResolver(contestSchema), defaultValues: toValues(contest), mode: "onTouched" });
  const { register, control, handleSubmit, formState } = form;
  const errors = formState.errors;
  const busy = create.isPending || update.isPending || lifecycle.isPending;
  // Every field has a default value, so the watched snapshot is complete.
  const values = useWatch({ control }) as ContestFormValues;
  const endsAt = !Number.isNaN(new Date(values.startsAt).getTime()) && values.durationMinutes ? new Date(new Date(values.startsAt).getTime() + values.durationMinutes * 60_000) : null;
  const status = contest && now ? getContestStatus(contest, now) : null;

  const save = (target: ContestLifecycle) =>
    handleSubmit(async (v) => {
      if (target === "published") {
        const issues = publishIssues(v, Date.now());
        setPublishErrors(issues);
        if (issues.length) return;
      } else setPublishErrors([]);
      try {
        const input = toInput(v, target);
        const saved = contest ? await update.mutateAsync({ id: contest.id, input }) : await create.mutateAsync(input);
        if (v.announcement?.trim()) {
          await announce.mutateAsync({ title: `${saved.shortTitle} update`, body: v.announcement.trim(), contestId: saved.id, pinned: false, published: true });
        }
        toast.success(target === "published" ? `${saved.title} published` : `${saved.title} saved as draft`);
        router.push("/admin/contests");
      } catch {
        /* the mutation hook already surfaced the error */
      }
    });

  const openPreview = () =>
    setPreview({
      ...toInput(values, contest?.lifecycle ?? "draft"),
      startsAt: Number.isNaN(new Date(values.startsAt).getTime()) ? new Date().toISOString() : new Date(values.startsAt).toISOString(),
      id: contest?.id ?? "preview",
      registeredCount: contest?.registeredCount ?? 0,
      createdBy: contest?.createdBy ?? "",
      updatedAt: new Date().toISOString(),
    });

  const isPublished = contest?.lifecycle === "published";
  const isArchived = contest?.lifecycle === "archived";

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/contests" className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Contests
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-[22px]">{contest ? `Edit ${contest.shortTitle}` : "New contest"}</h1>
            {status && <ContestStatusBadge status={status} />}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{contest ? `Last updated ${fmtDateTime(contest.updatedAt)}` : "Drafts are only visible to CP leads and admins."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={openPreview}>
            <Eye /> Preview
          </Button>
          {isArchived ? (
            <Button type="button" variant="outline" disabled={busy} onClick={() => contest && lifecycle.mutate({ id: contest.id, lifecycle: "published" })}>
              <ArchiveRestore /> Restore
            </Button>
          ) : contest ? (
            <Button type="button" variant="outline" disabled={busy} onClick={() => lifecycle.mutate({ id: contest.id, lifecycle: "archived" }, { onSuccess: () => router.push("/admin/contests") })}>
              <Archive /> Archive
            </Button>
          ) : null}
          {!isPublished && (
            <Button type="button" variant="outline" disabled={busy} onClick={save("draft")}>
              {busy ? <Loader2 className="animate-spin" /> : <Save />} Save draft
            </Button>
          )}
          <Button type="button" disabled={busy} onClick={save("published")}>
            {busy ? <Loader2 className="animate-spin" /> : <Rocket />} {isPublished ? "Save changes" : "Publish"}
          </Button>
        </div>
      </div>

      {publishErrors.length > 0 && (
        <div role="alert" className="mb-4 flex gap-2.5 rounded-lg border border-warning/40 bg-warning/8 p-3 text-[13px]">
          <AlertTriangle className="mt-px size-4 shrink-0 text-warning" />
          <div>
            <p className="font-medium">This contest can&apos;t be published yet</p>
            <ul className="mt-1 list-disc pl-4 text-muted-foreground">
              {publishErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid min-w-0 content-start gap-4">
          <Card>
            <CardHeader className="flex-col">
              <CardTitle>Basics</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
                <Field id="title" label="Name" required error={errors.title?.message}>
                  <Input placeholder="ChefArena Weekly #44" {...register("title")} />
                </Field>
                <Field id="shortTitle" label="Short name" required error={errors.shortTitle?.message}>
                  <Input placeholder="Weekly #44" {...register("shortTitle")} />
                </Field>
              </div>
              <Field id="description" label="Description" required error={errors.description?.message}>
                <Textarea rows={3} placeholder="What should participants expect?" {...register("description")} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-col">
              <CardTitle>Problems</CardTitle>
              <CardDescription>Order determines the letters A, B, C… Problems stay hidden from members until the contest starts.</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="problemIds"
                render={({ field }) => (
                  <div className="grid gap-1.5">
                    {problems.isPending && <Skeleton className="h-32" />}
                    {problems.data?.map((p) => {
                      const index = field.value.indexOf(p.id);
                      const checked = index >= 0;
                      const elsewhere = p.contestId && p.contestId !== contest?.id;
                      return (
                        <label
                          key={p.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                            checked ? "border-primary/50 bg-primary-soft" : "border-border hover:border-border-strong",
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => field.onChange(v ? [...field.value, p.id] : field.value.filter((id) => id !== p.id))}
                            aria-label={`Assign ${p.title}`}
                          />
                          <span className="flex size-6 items-center justify-center rounded bg-surface-2 font-mono text-xs font-semibold">{checked ? String.fromCharCode(65 + index) : "–"}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium">{p.title}</span>
                            <span className="block text-[11px] text-muted-foreground">
                              <span className="font-mono">{p.id}</span> · {p.points} pts{elsewhere ? ` · used in ${p.contestId}` : ""}
                            </span>
                          </span>
                          <DifficultyLabel difficulty={p.difficulty} />
                        </label>
                      );
                    })}
                    {errors.problemIds && <p className="text-xs text-destructive">{errors.problemIds.message}</p>}
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-col">
              <CardTitle>Rules & announcement</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field id="rules" label="Rules" hint="One rule per line." required error={errors.rules?.message}>
                <Textarea rows={5} {...register("rules")} />
              </Field>
              <Field id="announcement" label="Announcement (optional)" hint="Posted to the contest page and sent as an in-app notification when you save." error={errors.announcement?.message}>
                <Textarea rows={2} placeholder="e.g. Problem C has been updated with clearer constraints." {...register("announcement")} />
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-4">
          <Card>
            <CardHeader className="flex-col">
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field id="startsAt" label="Start time" required error={errors.startsAt?.message}>
                <Input type="datetime-local" {...register("startsAt")} />
              </Field>
              <Field id="durationMinutes" label="Duration (minutes)" required error={errors.durationMinutes?.message}>
                <Input type="number" min={30} step={15} {...register("durationMinutes", { valueAsNumber: true })} />
              </Field>
              <div className="rounded-lg bg-surface-2/60 px-3 py-2 text-xs text-muted-foreground">
                Ends <span className="font-medium text-foreground">{endsAt ? fmtDateTime(endsAt.toISOString()) : "—"}</span>
                {values.durationMinutes > 0 && ` · ${fmtDuration(values.durationMinutes)}`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-col">
              <CardTitle>Scoring</CardTitle>
              <CardDescription>ICPC format.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field id="penaltyMinutes" label="Penalty (min)" error={errors.penaltyMinutes?.message}>
                  <Input type="number" min={0} {...register("penaltyMinutes", { valueAsNumber: true })} />
                </Field>
                <Field id="freezeMinutes" label="Freeze (min)" error={errors.freezeMinutes?.message}>
                  <Input type="number" min={0} {...register("freezeMinutes", { valueAsNumber: true })} />
                </Field>
              </div>
              <Controller
                control={control}
                name="penalizeCompilationError"
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="penalizeCE" className="font-normal">
                      Penalise compilation errors
                    </Label>
                    <Switch id="penalizeCE" checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-col">
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="visibility"
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="gap-3">
                    {[
                      { v: "department", l: "Department", d: "All active members can see and join." },
                      { v: "invite-only", l: "Invite-only", d: "Only explicitly registered members." },
                    ].map((o) => (
                      <label key={o.v} className="flex cursor-pointer items-start gap-2.5">
                        <RadioGroupItem value={o.v} className="mt-0.5" />
                        <span>
                          <span className="block text-[13px] font-medium">{o.l}</span>
                          <span className="block text-xs text-muted-foreground">{o.d}</span>
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <ContestPreviewDialog contest={preview} onOpenChange={(o) => !o && setPreview(null)} />
    </form>
  );
}
