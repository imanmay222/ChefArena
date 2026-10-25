import type { Submission, SubmissionUpdate, Topic } from "@/types";
import type { SubmissionService } from "@/lib/services/contracts";
import { ServiceError } from "@/lib/services/errors";
import { elapsedContestMinutes, getContestStatus } from "@/lib/contests/status";
import { planVerdict, simulateRun, type JudgePlan } from "@/lib/judge/mock-judge";
import { VERDICT_META } from "@/lib/utils/format";
import { clone, getDb, latency, nextId, persist, solveStateFor, toPublicProblem } from "./db";
import { requireUser } from "./session";

/*
 * Simulated judging pipeline: queued → compiling → running → completed.
 * Timers live at module scope so judging continues across client-side
 * navigations. In production this is replaced by Judge0 behind the Go API,
 * with updates pushed over a WebSocket.
 */

type Listener = (update: SubmissionUpdate) => void;
const listeners = new Map<string, Set<Listener>>();
const timers = new Map<string, ReturnType<typeof setTimeout>[]>();

function emit(submission: Submission) {
  const update: SubmissionUpdate = {
    id: submission.id,
    status: submission.status,
    verdict: submission.verdict,
    passedTests: submission.passedTests,
    totalTests: submission.totalTests,
    submission: clone(submission),
  };
  listeners.get(submission.id)?.forEach((fn) => fn(update));
}

function findSubmission(id: string) {
  return getDb().submissions.find((s) => s.id === id);
}

function bumpTopic(record: Record<Topic, number>, topic: Topic | undefined) {
  if (topic) record[topic] = (record[topic] ?? 0) + 1;
}

/** Apply the planned verdict and its side effects (solve counts, notification). */
function complete(id: string) {
  const db = getDb();
  const submission = findSubmission(id);
  const plan = db.pendingPlans[id];
  if (!submission || !plan) return;

  const problem = db.problems.find((p) => p.id === submission.problemId);
  const wasSolved = solveStateFor(db, submission.userId, submission.problemId) === "solved";

  Object.assign(submission, {
    status: "completed",
    verdict: plan.verdict,
    passedTests: plan.passedTests,
    totalTests: plan.totalTests,
    failedTest: plan.failedTest,
    timeMs: plan.timeMs,
    memoryKb: plan.memoryKb,
    compileOutput: plan.compileOutput,
  } satisfies Partial<Submission>);
  delete db.pendingPlans[id];

  // Only a (simulated) Accepted verdict updates solve statistics.
  if (plan.verdict === "accepted" && !wasSolved && problem) {
    const profile = db.profiles.find((p) => p.userId === submission.userId);
    if (profile) {
      profile.problemsSolved += 1;
      profile.solvedByDifficulty[problem.difficulty] += 1;
      bumpTopic(profile.solvedByTopic, problem.topics[0]);
      const century = profile.achievements.find((a) => a.id === "ach-century");
      if (century?.progress) {
        century.progress.current = Math.min(century.progress.target, profile.problemsSolved);
        if (century.progress.current >= century.progress.target && !century.earnedAt) century.earnedAt = new Date().toISOString();
      }
    }
  }

  const meta = VERDICT_META[plan.verdict];
  db.notifications.unshift({
    id: nextId("n-"),
    userId: submission.userId,
    type: "submission_result",
    title: `${meta.label} · ${problem?.title ?? submission.problemId}`,
    body:
      plan.verdict === "accepted"
        ? `Submission ${submission.id} passed all ${plan.totalTests} tests in ${plan.timeMs} ms (simulated).`
        : plan.verdict === "compilation_error"
          ? `Submission ${submission.id} did not compile (simulated).`
          : `Submission ${submission.id} failed on test ${plan.failedTest} (simulated).`,
    href: submission.contestId && submission.kind === "contest" ? `/contests/${submission.contestId}/problems/${submission.problemId}` : `/problems/${submission.problemId}`,
    createdAt: new Date().toISOString(),
    read: false,
  });

  persist();
  emit(submission);
}

function schedule(id: string, delay: number, fn: () => void) {
  const handle = setTimeout(fn, delay);
  timers.set(id, [...(timers.get(id) ?? []), handle]);
}

function runPipeline(id: string, plan: JudgePlan) {
  const update = (patch: Partial<Submission>) => {
    const s = findSubmission(id);
    if (!s) return;
    Object.assign(s, patch);
    persist();
    emit(s);
  };

  schedule(id, 650, () => update({ status: "compiling" }));
  if (plan.verdict === "compilation_error") {
    schedule(id, 1700, () => complete(id));
    return;
  }
  schedule(id, 1500, () => update({ status: "running", passedTests: 0 }));
  const steps = plan.verdict === "accepted" ? plan.totalTests : plan.passedTests;
  for (let i = 1; i <= steps; i++) schedule(id, 1500 + i * 380, () => update({ passedTests: i }));
  schedule(id, 1500 + (steps + 1) * 380 + 200, () => {
    complete(id);
    timers.delete(id);
  });
}

let resumed = false;
/** Finish submissions that were mid-judging when the page was reloaded. */
function ensureResumed() {
  if (resumed || typeof window === "undefined") return;
  resumed = true;
  const db = getDb();
  for (const s of db.submissions) {
    if (s.status === "completed") continue;
    const plan = db.pendingPlans[s.id];
    if (plan) runPipeline(s.id, plan);
    else Object.assign(s, { status: "completed", verdict: "wrong_answer" });
  }
}

export function startJudging(submission: Submission, plan: JudgePlan) {
  getDb().pendingPlans[submission.id] = plan;
  persist();
  runPipeline(submission.id, plan);
}

export const mockSubmissionService: SubmissionService = {
  async runCode({ problemId, language, source }) {
    requireUser();
    const db = getDb();
    const seed = db.problems.find((p) => p.id === problemId);
    if (!seed) throw new ServiceError("Problem not found", "not_found");
    await latency(900);
    return simulateRun(source, language, toPublicProblem(db, seed).samples, seed.timeLimitMs);
  },

  async createSubmission({ problemId, contestId, language, source, simulateVerdict = "auto" }) {
    ensureResumed();
    const user = requireUser();
    const db = getDb();
    const seed = db.problems.find((p) => p.id === problemId);
    if (!seed) throw new ServiceError("Problem not found", "not_found");
    if (!source.trim()) throw new ServiceError("Your source code is empty.", "validation");
    if (source.length > 64_000) throw new ServiceError("Source code exceeds the 64 KB limit.", "validation");

    const now = Date.now();
    const contest = contestId ? db.contests.find((c) => c.id === contestId) : undefined;
    const status = contest ? getContestStatus(contest, now) : null;
    if (contest && (status === "scheduled" || status === "upcoming" || status === "draft")) {
      throw new ServiceError("This contest has not started yet.", "forbidden");
    }
    const isOfficial = !!contest && status === "ongoing" && seed.contestId === contest.id;

    if (isOfficial && contest) {
      const firstInContest = !db.submissions.some((s) => s.userId === user.id && s.contestId === contest.id && s.kind === "contest") &&
        !(db.judgeEvents[contest.id] ?? []).some((e) => e.userId === user.id);
      if (firstInContest) {
        const profile = db.profiles.find((p) => p.userId === user.id);
        if (profile) profile.contestsAttended += 1;
      }
    }
    if (solveStateFor(db, user.id, problemId) === "unsolved") {
      const profile = db.profiles.find((p) => p.userId === user.id);
      if (profile) bumpTopic(profile.attemptedByTopic, seed.topics[0]);
    }

    await latency(300);
    const plan = planVerdict(source, language, seed.testCases, seed, simulateVerdict);
    const submission: Submission = {
      id: nextId("S-"),
      userId: user.id,
      problemId,
      contestId: contest?.id ?? null,
      kind: isOfficial ? "contest" : "practice",
      language,
      source,
      status: "queued",
      verdict: null,
      contestMinute: isOfficial && contest ? elapsedContestMinutes(contest, now) : null,
      createdAt: new Date(now).toISOString(),
      timeMs: null,
      memoryKb: null,
      passedTests: null,
      totalTests: plan.totalTests,
      failedTest: null,
    };
    db.submissions.unshift(submission);
    startJudging(submission, plan);
    return clone(submission);
  },

  watchSubmission(id, onUpdate) {
    ensureResumed();
    const set = listeners.get(id) ?? new Set<Listener>();
    set.add(onUpdate);
    listeners.set(id, set);
    const current = findSubmission(id);
    if (current) queueMicrotask(() => emit(current));
    return () => {
      set.delete(onUpdate);
      if (!set.size) listeners.delete(id);
    };
  },

  async getSubmissions(filters = {}) {
    ensureResumed();
    await latency();
    const user = requireUser();
    return clone(
      getDb()
        .submissions.filter((s) => s.userId === user.id)
        .filter((s) => !filters.problemId || s.problemId === filters.problemId)
        .filter((s) => !filters.verdict || s.verdict === filters.verdict)
        .filter((s) => !filters.language || s.language === filters.language)
        .filter((s) =>
          !filters.contestId ? true : filters.contestId === "practice" ? s.kind === "practice" : s.contestId === filters.contestId && s.kind === "contest",
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },
};
