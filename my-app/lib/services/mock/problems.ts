import type { ProblemListItem } from "@/types";
import type { ProblemService } from "@/lib/services/contracts";
import { getContestStatus } from "@/lib/contests/status";
import type { ProblemSeed } from "@/lib/mock-data/problems";
import { getDb, latency, solveStateFor, toPublicProblem, type MockDbState } from "./db";
import { requireUser } from "./session";

/**
 * Visibility rules for members:
 *  - problems of contests that have not started are hidden entirely;
 *  - problems of a live contest are listed in the archive as locked and can
 *    only be opened from the contest arena;
 *  - unpublished problems are hidden.
 */
function toItem(db: MockDbState, userId: string, seed: ProblemSeed, now: number, context: "archive" | "contest"): ProblemListItem | null {
  if (!seed.published) return null;
  const contest = seed.contestId ? db.contests.find((c) => c.id === seed.contestId) : undefined;
  let locked = false;
  let lockReason: string | undefined;
  let editorialVisible = !contest;
  if (contest) {
    const status = getContestStatus(contest, now);
    editorialVisible = status === "ended" || status === "archived";
    if (status === "draft" || status === "scheduled" || status === "upcoming") return null;
    if (status === "ongoing" && context === "archive") {
      locked = true;
      lockReason = `Part of the live ${contest.shortTitle}. Solve it from the contest arena.`;
    }
  }
  return {
    problem: { ...toPublicProblem(db, seed), editorial: editorialVisible ? seed.editorial : undefined },
    state: solveStateFor(db, userId, seed.id),
    locked,
    lockReason,
    contestTitle: contest?.shortTitle,
  };
}

export const mockProblemService: ProblemService = {
  async getProblems() {
    await latency();
    const user = requireUser();
    const db = getDb();
    const now = Date.now();
    return db.problems.map((p) => toItem(db, user.id, p, now, "archive")).filter((x): x is ProblemListItem => x !== null);
  },

  async getContestProblems(contestId) {
    await latency(180);
    const user = requireUser();
    const db = getDb();
    const contest = db.contests.find((c) => c.id === contestId);
    if (!contest) return [];
    const now = Date.now();
    return contest.problemIds
      .map((id) => db.problems.find((p) => p.id === id))
      .filter((p): p is ProblemSeed => !!p)
      .map((p) => toItem(db, user.id, p, now, "contest"))
      .filter((x): x is ProblemListItem => x !== null);
  },

  async getProblemById(id) {
    await latency(160);
    const user = requireUser();
    const db = getDb();
    const seed = db.problems.find((p) => p.id === id);
    return seed ? toItem(db, user.id, seed, Date.now(), "archive") : null;
  },
};
