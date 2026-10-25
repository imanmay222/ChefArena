"use client";

import { Check, Copy } from "lucide-react";
import type { Submission } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VerdictBadge } from "@/components/ui/status-badges";
import { useCopy } from "@/hooks/use-copy";
import { LANGUAGES } from "@/lib/editor/languages";
import { fmtDateTime, fmtMemory, fmtRuntime } from "@/lib/utils/format";

export function SourceDialog({
  submission,
  problemTitle,
  onOpenChange,
}: {
  submission: Submission | null;
  problemTitle?: string;
  onOpenChange: (open: boolean) => void;
}) {
  const { copied, copy } = useCopy();
  return (
    <Dialog open={!!submission} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        {submission && (
          <>
            <DialogHeader className="border-b border-border p-5 pr-12">
              <DialogTitle className="flex flex-wrap items-center gap-2">
                <span className="font-mono">{submission.id}</span>
                <VerdictBadge verdict={submission.verdict} status={submission.status} />
                {submission.rejudged && <span className="text-xs font-normal text-muted-foreground">rejudged</span>}
              </DialogTitle>
              <DialogDescription>
                {submission.problemId}
                {problemTitle ? ` · ${problemTitle}` : ""} · {LANGUAGES[submission.language].version} · {fmtDateTime(submission.createdAt)}
              </DialogDescription>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Time <span className="font-mono text-foreground">{fmtRuntime(submission.timeMs)}</span>
                </span>
                <span>
                  Memory <span className="font-mono text-foreground">{fmtMemory(submission.memoryKb)}</span>
                </span>
                <span>
                  Tests{" "}
                  <span className="font-mono text-foreground">
                    {submission.passedTests ?? 0}/{submission.totalTests ?? "—"}
                  </span>
                </span>
                <span>{submission.kind === "contest" ? `Contest · minute ${submission.contestMinute}` : "Practice (unofficial)"}</span>
              </div>
            </DialogHeader>
            {submission.compileOutput && (
              <pre className="mx-5 mt-4 overflow-x-auto rounded-lg border border-destructive/30 bg-destructive/5 p-3 font-mono text-xs text-destructive">{submission.compileOutput}</pre>
            )}
            <div className="relative m-5 overflow-hidden rounded-lg border border-border bg-editor">
              <Button variant="outline" size="xs" className="absolute top-2 right-2 z-10" onClick={() => copy(submission.source, "src")}>
                {copied === "src" ? <Check className="text-success" /> : <Copy />} {copied === "src" ? "Copied" : "Copy"}
              </Button>
              <pre className="max-h-[55dvh] overflow-auto py-3 font-mono text-[12.5px] leading-relaxed scrollbar-thin">
                {submission.source.split("\n").map((line, i) => (
                  <div key={i} className="flex">
                    <span className="sticky left-0 w-10 shrink-0 bg-editor pr-3 text-right text-muted-foreground/50 select-none">{i + 1}</span>
                    <span className="pr-4 whitespace-pre">{line || " "}</span>
                  </div>
                ))}
              </pre>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
