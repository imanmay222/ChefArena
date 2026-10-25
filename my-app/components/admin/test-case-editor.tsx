"use client";

import { useRef, useState } from "react";
import { ChevronDown, EyeOff, FileUp, Globe, Plus, Trash2 } from "lucide-react";
import type { TestCase } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils/cn";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

export type EditableTestCase = Omit<TestCase, "problemId">;

/** Field order matters: forms compare JSON snapshots to detect unsaved changes. */
export const toEditable = (tc: TestCase): EditableTestCase => ({
  id: tc.id,
  label: tc.label,
  kind: tc.kind,
  input: tc.input,
  output: tc.output,
  weight: tc.weight,
  explanation: tc.explanation,
  inputFileName: tc.inputFileName,
  outputFileName: tc.outputFileName,
});

let seq = 0;
export function newTestCase(kind: TestCase["kind"], index: number): EditableTestCase {
  seq += 1;
  return { id: `new-${Date.now().toString(36)}-${seq}`, label: kind === "sample" ? `Sample ${index}` : `Hidden ${index}`, kind, input: "", output: "", weight: 1 };
}

function UploadButton({ label, onLoad }: { label: string; onLoad: (text: string, fileName: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept=".in,.out,.txt,.ans,text/plain"
        className="sr-only"
        aria-label={label}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (file.size > MAX_FILE_BYTES) return setError("File is larger than 2 MB");
          setError(null);
          onLoad(await file.text(), file.name);
        }}
      />
      <Button type="button" variant="ghost" size="xs" onClick={() => ref.current?.click()}>
        <FileUp /> {label}
      </Button>
      {error && <span className="text-[11px] text-destructive">{error}</span>}
    </>
  );
}

export function TestCaseEditor({
  cases,
  onChange,
  error,
}: {
  cases: EditableTestCase[];
  onChange: (cases: EditableTestCase[]) => void;
  error?: string;
}) {
  const [open, setOpen] = useState<string | null>(cases[0]?.id ?? null);
  const [deleting, setDeleting] = useState<EditableTestCase | null>(null);
  const patch = (id: string, change: Partial<EditableTestCase>) => onChange(cases.map((c) => (c.id === id ? { ...c, ...change } : c)));
  const add = (kind: TestCase["kind"]) => {
    const tc = newTestCase(kind, cases.filter((c) => c.kind === kind).length + 1);
    onChange([...cases, tc]);
    setOpen(tc.id);
  };
  const samples = cases.filter((c) => c.kind === "sample").length;

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {samples} public sample{samples === 1 ? "" : "s"} · {cases.length - samples} hidden. Hidden tests are never sent to members.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => add("sample")}>
            <Plus /> Sample
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => add("hidden")}>
            <Plus /> Hidden test
          </Button>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {cases.length === 0 && <p className="rounded-lg border border-dashed border-border py-8 text-center text-[13px] text-muted-foreground">No test cases yet.</p>}
      <ol className="grid gap-2">
        {cases.map((tc, i) => {
          const expanded = open === tc.id;
          const invalid = !tc.input.trim() || !tc.output.trim();
          return (
            <li key={tc.id} className={cn("rounded-lg border bg-card", invalid ? "border-warning/40" : "border-border")}>
              <div className="flex items-center gap-2 px-3 py-2">
                <button type="button" onClick={() => setOpen(expanded ? null : tc.id)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left" aria-expanded={expanded}>
                  <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", !expanded && "-rotate-90")} />
                  <span className="font-mono text-xs text-muted-foreground">#{i + 1}</span>
                  <span className="truncate text-[13px] font-medium">{tc.label || "Untitled"}</span>
                  {tc.kind === "sample" ? (
                    <Badge variant="info">
                      <Globe /> Public
                    </Badge>
                  ) : (
                    <Badge variant="neutral">
                      <EyeOff /> Hidden
                    </Badge>
                  )}
                  {(tc.inputFileName || tc.outputFileName) && (
                    <span className="hidden truncate font-mono text-[11px] text-muted-foreground sm:inline">{[tc.inputFileName, tc.outputFileName].filter(Boolean).join(" / ")}</span>
                  )}
                  {invalid && <span className="text-[11px] text-warning">incomplete</span>}
                </button>
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => setDeleting(tc)} aria-label={`Delete ${tc.label}`}>
                  <Trash2 />
                </Button>
              </div>
              {expanded && (
                <div className="grid gap-3 border-t border-border p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_140px_100px]">
                    <div className="grid gap-1.5">
                      <Label htmlFor={`${tc.id}-label`}>Label</Label>
                      <Input id={`${tc.id}-label`} value={tc.label} onChange={(e) => patch(tc.id, { label: e.target.value })} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor={`${tc.id}-kind`}>Visibility</Label>
                      <div id={`${tc.id}-kind`} role="radiogroup" className="flex h-9 rounded-md border border-input p-0.5">
                        {(["sample", "hidden"] as const).map((k) => (
                          <button
                            key={k}
                            type="button"
                            role="radio"
                            aria-checked={tc.kind === k}
                            onClick={() => patch(tc.id, { kind: k })}
                            className={cn("flex-1 cursor-pointer rounded text-xs capitalize", tc.kind === k ? "bg-accent font-medium text-foreground" : "text-muted-foreground")}
                          >
                            {k === "sample" ? "Public" : "Hidden"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor={`${tc.id}-weight`}>Weight</Label>
                      <Input id={`${tc.id}-weight`} type="number" min={1} max={10} value={tc.weight} onChange={(e) => patch(tc.id, { weight: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })} />
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="grid gap-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${tc.id}-in`}>Input</Label>
                        <UploadButton label="Upload .in" onLoad={(text, name) => patch(tc.id, { input: text, inputFileName: name })} />
                      </div>
                      <Textarea id={`${tc.id}-in`} rows={4} className="font-mono text-xs" value={tc.input} onChange={(e) => patch(tc.id, { input: e.target.value })} />
                      {tc.inputFileName && <p className="font-mono text-[11px] text-muted-foreground">{tc.inputFileName}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${tc.id}-out`}>Expected output</Label>
                        <UploadButton label="Upload .out" onLoad={(text, name) => patch(tc.id, { output: text, outputFileName: name })} />
                      </div>
                      <Textarea id={`${tc.id}-out`} rows={4} className="font-mono text-xs" value={tc.output} onChange={(e) => patch(tc.id, { output: e.target.value })} />
                      {tc.outputFileName && <p className="font-mono text-[11px] text-muted-foreground">{tc.outputFileName}</p>}
                    </div>
                  </div>
                  {tc.kind === "sample" && (
                    <div className="grid gap-1.5">
                      <Label htmlFor={`${tc.id}-exp`}>Explanation (shown to members)</Label>
                      <Input id={`${tc.id}-exp`} value={tc.explanation ?? ""} onChange={(e) => patch(tc.id, { explanation: e.target.value || undefined })} />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              The test case is removed from this form. It is permanently deleted when you save. Rejudge affected submissions afterwards if the verdicts depend on it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction destructive onClick={() => deleting && onChange(cases.filter((c) => c.id !== deleting.id))}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
