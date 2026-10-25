import type { JudgeEvent, ProblemResult, StandingRow, UserSummary } from "@/types";

/**
 * ICPC-style standings.
 *
 * Rules (documented in README):
 *  1. Rank by number of problems solved (more is better).
 *  2. Break ties by total penalty time (less is better).
 *  3. A solved problem contributes the elapsed minute of its first accepted submission…
 *  4. …plus `penaltyMinutes` for every rejected submission before that first AC.
 *  5. Submissions made after a problem is solved are ignored (no penalty).
 *  6. Submissions after the deadline never count. A late AC is surfaced as
 *     `acceptedAfterDeadline` for transparency but does not change the score.
 *  7. Remaining ties are broken by the earlier last-accepted minute. Rows equal
 *     on all three keys share a rank and are ordered by handle, then user id,
 *     so the output is deterministic.
 *
 * Compilation errors are ignored entirely unless `penalizeCompilationError`.
 */
export interface IcpcOptions {
  problemIds: string[];
  durationMinutes: number;
  penaltyMinutes: number;
  penalizeCompilationError: boolean;
  /** For live contests: ignore events after this minute (they have not happened yet). */
  untilMinute?: number;
}

export function computeIcpcStandings(
  events: JudgeEvent[],
  participants: UserSummary[],
  options: IcpcOptions,
): StandingRow[] {
  const { problemIds, durationMinutes, penaltyMinutes, penalizeCompilationError, untilMinute = Infinity } = options;
  const problemSet = new Set(problemIds);

  // Stable chronological order; ties keep their original order.
  const ordered = events
    .map((event, index) => ({ event, index }))
    .filter(({ event }) => problemSet.has(event.problemId) && event.minute <= untilMinute)
    .sort((a, b) => a.event.minute - b.event.minute || a.index - b.index)
    .map(({ event }) => event);

  const emptyResult = (problemId: string): ProblemResult => ({
    problemId,
    solved: false,
    solvedAtMinute: null,
    rejectedAttempts: 0,
    penalty: 0,
    firstToSolve: false,
    acceptedAfterDeadline: false,
    pending: false,
  });

  const byUser = new Map<string, Record<string, ProblemResult>>();
  for (const p of participants) {
    byUser.set(p.id, Object.fromEntries(problemIds.map((id) => [id, emptyResult(id)])));
  }

  for (const event of ordered) {
    const results = byUser.get(event.userId);
    if (!results) continue;
    const result = results[event.problemId];
    if (result.solved) continue; // rule 5

    if (event.minute > durationMinutes) {
      // rule 6
      if (event.verdict === "accepted") result.acceptedAfterDeadline = true;
      continue;
    }
    if (event.verdict === "compilation_error" && !penalizeCompilationError) continue;

    if (event.verdict === "accepted") {
      result.solved = true;
      result.solvedAtMinute = event.minute;
      result.penalty = event.minute + result.rejectedAttempts * penaltyMinutes; // rules 3 & 4
    } else {
      result.rejectedAttempts += 1;
    }
  }

  // First-to-solve markers.
  for (const problemId of problemIds) {
    let best: ProblemResult | null = null;
    for (const results of byUser.values()) {
      const r = results[problemId];
      if (r.solved && (best === null || (r.solvedAtMinute ?? 0) < (best.solvedAtMinute ?? 0))) best = r;
    }
    if (best) best.firstToSolve = true;
  }

  const rows: StandingRow[] = participants.map((participant) => {
    const results = byUser.get(participant.id)!;
    const solvedResults = Object.values(results).filter((r) => r.solved);
    return {
      rank: 0,
      participant,
      solved: solvedResults.length,
      penalty: solvedResults.reduce((sum, r) => sum + r.penalty, 0),
      lastAcceptedMinute: solvedResults.length ? Math.max(...solvedResults.map((r) => r.solvedAtMinute ?? 0)) : null,
      results,
    };
  });

  rows.sort(compareRows);

  let previous: StandingRow | null = null;
  rows.forEach((row, i) => {
    row.rank = previous && scoreKey(previous) === scoreKey(row) ? previous.rank : i + 1;
    previous = row;
  });

  return rows;
}

function scoreKey(row: StandingRow) {
  return `${row.solved}|${row.penalty}|${row.lastAcceptedMinute ?? -1}`;
}

function compareRows(a: StandingRow, b: StandingRow) {
  return (
    b.solved - a.solved ||
    a.penalty - b.penalty ||
    (a.lastAcceptedMinute ?? Infinity) - (b.lastAcceptedMinute ?? Infinity) ||
    a.participant.handle.localeCompare(b.participant.handle) ||
    a.participant.id.localeCompare(b.participant.id)
  );
}
