import type { Contest, ContestStandings, DepartmentRow, StandingRow } from "@/types";
import { computeIcpcStandings } from "@/lib/scoring/icpc";
import { contestPointsForRow, rankByPoints } from "@/lib/scoring/department";
import { contestStartMs, elapsedContestMinutes, getContestStatus } from "@/lib/contests/status";
import { contestEvents, toSummary, type MockDbState } from "./db";

/** Standings are always computed from judge events — never stored. */
export function buildStandings(db: MockDbState, contest: Contest, now: number): ContestStandings {
  const status = getContestStatus(contest, now);
  const generatedAt = new Date(now).toISOString();
  if (status === "draft" || status === "scheduled" || status === "upcoming") {
    return { contestId: contest.id, state: "not-started", problemIds: contest.problemIds, rows: [], generatedAt };
  }

  const events = contestEvents(db, contest.id);
  const ids = [...new Set(events.map((e) => e.userId))];
  const participants = ids
    .map((id) => db.users.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => !!u)
    .map(toSummary);

  const rows = computeIcpcStandings(events, participants, {
    problemIds: contest.problemIds,
    durationMinutes: contest.durationMinutes,
    penaltyMinutes: contest.scoring.penaltyMinutes,
    penalizeCompilationError: contest.scoring.penalizeCompilationError,
    untilMinute: status === "ongoing" ? elapsedContestMinutes(contest, now) : undefined,
  });

  // Mark problems with a submission still being judged.
  for (const s of db.submissions) {
    if (s.contestId !== contest.id || s.kind !== "contest" || s.status === "completed") continue;
    const row = rows.find((r) => r.participant.id === s.userId);
    if (row?.results[s.problemId] && !row.results[s.problemId].solved) row.results[s.problemId].pending = true;
  }

  return { contestId: contest.id, state: status === "ongoing" ? "provisional" : "final", problemIds: contest.problemIds, rows, generatedAt };
}

export function buildDepartmentLeaderboard(db: MockDbState, now: number): DepartmentRow[] {
  const contests = db.contests
    .filter((c) => c.lifecycle !== "draft" && contestStartMs(c) <= now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const problemPoints = Object.fromEntries(db.problems.map((p) => [p.id, p.points]));
  const perContest = contests.map((contest) => {
    const standings = buildStandings(db, contest, now);
    const points = new Map<string, number>();
    standings.rows.forEach((row: StandingRow) =>
      points.set(row.participant.id, contestPointsForRow(row, problemPoints, standings.state === "final")),
    );
    return points;
  });

  const participants = db.users.filter(
    (u) => u.role === "member" && u.status === "active" && u.invitation === "accepted",
  );

  const totals = (upto: number) =>
    rankByPoints(
      participants.map((u) => ({
        userId: u.id,
        handle: u.handle,
        points: (db.seasonBaseline[u.id] ?? 0) + perContest.slice(0, upto).reduce((sum, m) => sum + (m.get(u.id) ?? 0), 0),
      })),
    );

  const current = totals(perContest.length);
  const previous = new Map(totals(Math.max(0, perContest.length - 1)).map((t) => [t.userId, t.rank]));

  return current.map((t) => {
    const user = participants.find((u) => u.id === t.userId)!;
    const profile = db.profiles.find((p) => p.userId === t.userId);
    return {
      rank: t.rank,
      previousRank: previous.get(t.userId) ?? t.rank,
      participant: toSummary(user),
      rating: user.rating,
      problemsSolved: profile?.problemsSolved ?? 0,
      contestsAttended: profile?.contestsAttended ?? 0,
      points: t.points,
    };
  });
}
