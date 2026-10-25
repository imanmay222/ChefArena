import type { ProfileStats } from "@/types";
import { DIFFICULTY_META } from "@/lib/utils/format";

/** Three labelled bars in one hue; difficulty is identified by label, not colour. */
export function DifficultyBreakdown({ stats }: { stats: ProfileStats }) {
  const rows = (["easy", "medium", "hard"] as const).map((d) => ({ d, n: stats.solvedByDifficulty[d] }));
  const total = rows.reduce((s, r) => s + r.n, 0);
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div>
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular">{total}</span>
        <span className="text-[13px] text-muted-foreground">problems solved</span>
      </div>
      <ul className="grid gap-3">
        {rows.map(({ d, n }) => (
          <li key={d} className="grid grid-cols-[64px_1fr_40px] items-center gap-3 text-[13px]">
            <span className={DIFFICULTY_META[d].className}>{DIFFICULTY_META[d].label}</span>
            <div className="h-5 rounded-[4px] bg-surface-2">
              <div className="h-full rounded-r-[4px] bg-primary" style={{ width: `${(n / max) * 100}%`, maxWidth: "100%" }} />
            </div>
            <span className="text-right font-mono text-xs tabular">{n}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        {total ? `${Math.round((rows[2].n / total) * 100)}% of your solves are hard problems.` : "No solves yet."}
      </p>
    </div>
  );
}
