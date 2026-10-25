import { Clock, Cpu, Star, Users } from "lucide-react";
import type { Problem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { DifficultyLabel } from "@/components/ui/status-badges";
import { TOPIC_LABEL } from "@/lib/utils/format";
import { RichText } from "./rich-text";
import { CodeBlock } from "./sample-block";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2 text-[13px] font-semibold tracking-tight text-foreground">{title}</h3>
      <div className="space-y-2 text-[14px] leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}

export function ProblemStatement({ problem, header = true, editorial }: { problem: Problem; header?: boolean; editorial?: string }) {
  return (
    <article className="min-w-0">
      {header && (
        <header>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{problem.id}</span>
            <span aria-hidden>·</span>
            <DifficultyLabel difficulty={problem.difficulty} />
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Star className="size-3" /> {problem.points} pts
            </span>
          </div>
          <h2 className="mt-1.5 text-xl font-semibold tracking-tight">
            {problem.code && <span className="mr-2 text-muted-foreground">{problem.code}.</span>}
            {problem.title}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" /> {problem.timeLimitMs / 1000}s
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Cpu className="size-3.5" /> {problem.memoryLimitMb} MB
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" /> {problem.solvedCount} solved
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {problem.topics.map((t) => (
              <Badge key={t} variant="outline">
                {TOPIC_LABEL[t]}
              </Badge>
            ))}
          </div>
        </header>
      )}

      <Section title="Statement">
        {problem.statement.map((p, i) => (
          <p key={i}>
            <RichText text={p} />
          </p>
        ))}
      </Section>

      <Section title="Input format">
        {problem.inputFormat.map((p, i) => (
          <p key={i}>
            <RichText text={p} />
          </p>
        ))}
      </Section>

      <Section title="Output format">
        {problem.outputFormat.map((p, i) => (
          <p key={i}>
            <RichText text={p} />
          </p>
        ))}
      </Section>

      {problem.constraints.length > 0 && (
        <Section title="Constraints">
          <ul className="space-y-1">
            {problem.constraints.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60" aria-hidden />
                <span className="font-mono text-[13px]">
                  <RichText text={c} />
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {problem.samples.map((s, i) => (
        <Section key={s.id} title={`Sample ${i + 1}`}>
          <div className="grid gap-2 sm:grid-cols-2">
            <CodeBlock label="Input" value={s.input} />
            <CodeBlock label="Output" value={s.output} />
          </div>
          {s.explanation && (
            <p className="text-[13px] text-muted-foreground">
              <span className="font-medium text-foreground">Explanation. </span>
              <RichText text={s.explanation} />
            </p>
          )}
        </Section>
      ))}

      {problem.notes && (
        <Section title="Notes">
          <p>
            <RichText text={problem.notes} />
          </p>
        </Section>
      )}

      {editorial && (
        <Section title="Editorial">
          <p className="rounded-lg border border-border bg-surface-2/50 p-3 text-[13px]">
            <RichText text={editorial} />
          </p>
        </Section>
      )}
    </article>
  );
}
