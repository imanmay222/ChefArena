import type { ProfileStats } from "@/types";
import { TOPICS, TOPIC_LABEL } from "@/lib/utils/format";

/** Meter per topic: solved / attempted. Track is a lighter step of the same hue. */
export function TopicProgress({ stats, limit }: { stats: ProfileStats; limit?: number }) {
  const rows = TOPICS.map((topic) => ({
    topic,
    solved: stats.solvedByTopic[topic] ?? 0,
    attempted: Math.max(stats.attemptedByTopic[topic] ?? 0, stats.solvedByTopic[topic] ?? 0),
  }))
    .filter((r) => r.attempted > 0)
    .sort((a, b) => b.solved - a.solved);
  const max = Math.max(1, ...rows.map((r) => r.attempted));
  const shown = limit ? rows.slice(0, limit) : rows;

  if (!shown.length) return <p className="py-6 text-center text-[13px] text-muted-foreground">Solve a few problems to see your topic breakdown.</p>;

  return (
    <ul className="grid gap-3">
      {shown.map((r) => (
        <li key={r.topic}>
          <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
            <span>{TOPIC_LABEL[r.topic]}</span>
            <span className="font-mono text-xs text-muted-foreground tabular">
              <span className="text-foreground">{r.solved}</span> / {r.attempted}
            </span>
          </div>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-primary/10" role="meter" aria-valuemin={0} aria-valuemax={r.attempted} aria-valuenow={r.solved} aria-label={`${TOPIC_LABEL[r.topic]}: ${r.solved} of ${r.attempted} attempted solved`}>
            <div className="absolute inset-y-0 left-0 rounded-full bg-primary/25" style={{ width: `${(r.attempted / max) * 100}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${(r.solved / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
