import type {
  Announcement,
  AppNotification,
  AuditEvent,
  Contest,
  JudgeEvent,
  Problem,
  Submission,
  User,
  UserSummary,
} from "@/types";
import { createTimeline } from "@/lib/mock-data/timeline";
import { seedUsers } from "@/lib/mock-data/users";
import { seedContests } from "@/lib/mock-data/contests";
import { seedProblems, type ProblemSeed } from "@/lib/mock-data/problems";
import { seedSubmissions } from "@/lib/mock-data/submissions";
import { seedJudgeEvents, seedSeasonBaseline } from "@/lib/mock-data/leaderboard";
import { seedProfiles, type ProfileSeed } from "@/lib/mock-data/profiles";
import { seedNotifications } from "@/lib/mock-data/notifications";
import { seedAnnouncements } from "@/lib/mock-data/announcements";
import { seedAuditLogs } from "@/lib/mock-data/audit-logs";
import type { JudgePlan } from "@/lib/judge/mock-judge";

/**
 * In-browser mock database.
 *
 * Seeded from lib/mock-data and persisted to localStorage so simulated
 * submissions and admin edits survive a refresh. It never stores passwords or
 * session tokens. Data older than MAX_AGE is re-seeded so contest timing stays
 * meaningful (one past, one live, one upcoming).
 */
const STORAGE_KEY = "chefarena.mockdb";
const VERSION = 3;
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export interface MockDbState {
  version: number;
  seededAt: number;
  users: User[];
  contests: Contest[];
  problems: ProblemSeed[];
  submissions: Submission[];
  /** Planned verdicts for submissions still being "judged". */
  pendingPlans: Record<string, JudgePlan>;
  judgeEvents: Record<string, JudgeEvent[]>;
  seasonBaseline: Record<string, number>;
  profiles: ProfileSeed[];
  notifications: AppNotification[];
  announcements: Announcement[];
  auditLogs: AuditEvent[];
  counter: number;
}

function seed(now: number): MockDbState {
  const t = createTimeline(now);
  return {
    version: VERSION,
    seededAt: now,
    users: seedUsers(t),
    contests: seedContests(t),
    problems: structuredClone(seedProblems),
    submissions: seedSubmissions(t),
    pendingPlans: {},
    judgeEvents: structuredClone(seedJudgeEvents),
    seasonBaseline: { ...seedSeasonBaseline },
    profiles: seedProfiles(t),
    notifications: seedNotifications(t),
    announcements: seedAnnouncements(t),
    auditLogs: seedAuditLogs(t),
    counter: 10500,
  };
}

let state: MockDbState | null = null;

function load(): MockDbState {
  const now = Date.now();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MockDbState;
      if (parsed.version === VERSION && now - parsed.seededAt < MAX_AGE_MS) return parsed;
    }
  } catch {
    /* corrupted or unavailable storage: fall through to a fresh seed */
  }
  return seed(now);
}

export function getDb(): MockDbState {
  // Services are only called from the browser; the server gets a throwaway seed.
  if (typeof window === "undefined") return seed(Date.now());
  if (!state) {
    state = load();
    persist();
  }
  return state;
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

export function persist() {
  if (typeof window === "undefined" || !state) return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota exceeded or storage disabled — keep working in memory */
    }
  }, 50);
}

export function resetMockDb() {
  if (typeof window === "undefined") return;
  state = seed(Date.now());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function nextId(prefix: string) {
  const db = getDb();
  db.counter += 1;
  return `${prefix}${db.counter}`;
}

/** Simulated network latency so loading states are visible. */
export function latency(ms = 220) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms + Math.round(Math.random() * 120)));
}

export const clone = <T,>(value: T): T => structuredClone(value);

/* ------------------------------------------------------------------ */
/* Derived data                                                        */
/* ------------------------------------------------------------------ */

export function toSummary(user: User): UserSummary {
  return { id: user.id, handle: user.handle, name: user.name, rating: user.rating, department: user.department };
}

/** All judge events for a contest: compact rival events + full submission records. */
export function contestEvents(db: MockDbState, contestId: string): JudgeEvent[] {
  const fromSubmissions: JudgeEvent[] = db.submissions
    .filter((s) => s.kind === "contest" && s.contestId === contestId && s.status === "completed" && s.verdict && s.contestMinute != null)
    .map((s) => ({ userId: s.userId, problemId: s.problemId, minute: s.contestMinute!, verdict: s.verdict!, submissionId: s.id }));
  return [...(db.judgeEvents[contestId] ?? []), ...fromSubmissions];
}

/** Every attempt across contests and practice, used for solve counts. */
function allAttempts(db: MockDbState) {
  const events = Object.values(db.judgeEvents).flat().map((e) => ({ userId: e.userId, problemId: e.problemId, accepted: e.verdict === "accepted" }));
  const subs = db.submissions
    .filter((s) => s.status === "completed")
    .map((s) => ({ userId: s.userId, problemId: s.problemId, accepted: s.verdict === "accepted" }));
  return [...events, ...subs];
}

export function toPublicProblem(db: MockDbState, seedProblem: ProblemSeed): Problem {
  const attempts = allAttempts(db).filter((a) => a.problemId === seedProblem.id);
  const solvedBy = new Set(attempts.filter((a) => a.accepted).map((a) => a.userId));
  const attemptedBy = new Set(attempts.map((a) => a.userId));
  // Strip judge-only material explicitly rather than spreading the seed.
  return {
    id: seedProblem.id,
    code: seedProblem.code,
    title: seedProblem.title,
    difficulty: seedProblem.difficulty,
    points: seedProblem.points,
    topics: [...seedProblem.topics],
    statement: [...seedProblem.statement],
    inputFormat: [...seedProblem.inputFormat],
    outputFormat: [...seedProblem.outputFormat],
    constraints: [...seedProblem.constraints],
    samples: seedProblem.testCases
      .filter((tc) => tc.kind === "sample")
      .map((tc) => ({ id: tc.id, input: tc.input, output: tc.output, explanation: tc.explanation })),
    notes: seedProblem.notes,
    timeLimitMs: seedProblem.timeLimitMs,
    memoryLimitMb: seedProblem.memoryLimitMb,
    languages: [...seedProblem.languages],
    contestId: seedProblem.contestId,
    author: seedProblem.author,
    solvedCount: solvedBy.size,
    attemptCount: attemptedBy.size,
    published: seedProblem.published,
  };
}

export function solveStateFor(db: MockDbState, userId: string, problemId: string) {
  const attempts = allAttempts(db).filter((a) => a.userId === userId && a.problemId === problemId);
  if (attempts.some((a) => a.accepted)) return "solved" as const;
  return attempts.length ? ("attempted" as const) : ("unsolved" as const);
}
