import type { StandingRow } from "@/types";

/**
 * Cumulative department points — deliberately independent of ICPC penalty.
 *
 * Per contest attended:
 *   + 10 participation points
 *   + the point value of every problem solved within the contest window
 *   + a podium bonus of 50 / 30 / 20 for ranks 1–3 once standings are final
 */
export const PARTICIPATION_POINTS = 10;
export const PODIUM_BONUS = [50, 30, 20] as const;

export function contestPointsForRow(row: StandingRow, problemPoints: Record<string, number>, isFinal: boolean) {
  const solvedPoints = Object.values(row.results)
    .filter((r) => r.solved)
    .reduce((sum, r) => sum + (problemPoints[r.problemId] ?? 0), 0);
  const bonus = isFinal && row.solved > 0 ? (PODIUM_BONUS[row.rank - 1] ?? 0) : 0;
  return PARTICIPATION_POINTS + solvedPoints + bonus;
}

export interface RankableTotal {
  userId: string;
  handle: string;
  points: number;
}

/** Competition ranking (1, 2, 2, 4) by points, deterministic by handle. */
export function rankByPoints<T extends RankableTotal>(totals: T[]): (T & { rank: number })[] {
  const sorted = [...totals].sort((a, b) => b.points - a.points || a.handle.localeCompare(b.handle));
  let prev: { points: number; rank: number } | null = null;
  return sorted.map((t, i) => {
    const rank = prev && prev.points === t.points ? prev.rank : i + 1;
    prev = { points: t.points, rank };
    return { ...t, rank };
  });
}
