import type { AuditAction, AuditEvent, Contest, ProblemInput, TestCaseValidationIssue, User } from "@/types";
import type { AdminService } from "@/lib/services/contracts";
import { ServiceError } from "@/lib/services/errors";
import { getContestStatus } from "@/lib/contests/status";
import { planVerdict } from "@/lib/judge/mock-judge";
import type { ProblemSeed } from "@/lib/mock-data/problems";
import { clone, getDb, latency, nextId, persist, toPublicProblem } from "./db";
import { requireRole } from "./session";
import { startJudging } from "./submissions";

/*
 * Mock admin adapter. Role checks here only demonstrate the intended rules —
 * the Go backend must enforce them. Every mutation appends an audit event.
 */
const requireStaff = () => requireRole("cp_lead", "super_admin");

function audit(actor: User, action: AuditAction, targetType: AuditEvent["targetType"], targetId: string, targetLabel: string, detail?: string) {
  getDb().auditLogs.unshift({
    id: nextId("log-"),
    actorId: actor.id,
    action,
    targetType,
    targetId,
    targetLabel,
    detail,
    createdAt: new Date().toISOString(),
  });
}

function toAdminProblem(seed: ProblemSeed) {
  const db = getDb();
  return clone({ ...seed, ...toPublicProblem(db, seed), testCases: seed.testCases });
}

/** Samples are derived from test cases, so any submitted `samples` array is dropped. */
function withoutSamples(input: ProblemInput): Omit<ProblemInput, "samples"> {
  const copy = { ...input };
  delete copy.samples;
  return copy;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function findContest(id: string): Contest {
  const contest = getDb().contests.find((c) => c.id === id);
  if (!contest) throw new ServiceError("Contest not found", "not_found");
  return contest;
}

/** Keep problem.contestId and letter codes consistent with a contest's problem list. */
function syncContestProblems(contest: Contest) {
  for (const p of getDb().problems) {
    const index = contest.problemIds.indexOf(p.id);
    if (index >= 0) {
      p.contestId = contest.id;
      p.code = String.fromCharCode(65 + index);
    } else if (p.contestId === contest.id) {
      p.contestId = null;
      p.code = "";
    }
  }
}

function findUser(id: string): User {
  const user = getDb().users.find((u) => u.id === id);
  if (!user) throw new ServiceError("User not found", "not_found");
  return user;
}

function assertUniqueUser(email: string, handle?: string) {
  const db = getDb();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new ServiceError(`${email} already has an account.`, "conflict");
  if (handle && db.users.some((u) => u.handle.toLowerCase() === handle.toLowerCase())) throw new ServiceError(`Handle ${handle} is taken.`, "conflict");
}

function newUser(input: { email: string; name: string; handle: string; role: User["role"]; batch: string }, invitation: User["invitation"]): User {
  return {
    id: nextId("u_"),
    email: input.email,
    name: input.name,
    handle: input.handle,
    role: input.role,
    department: "Computer Science & Engineering",
    batch: input.batch,
    rating: 0,
    maxRating: 0,
    status: "active",
    invitation,
    joinedAt: new Date().toISOString(),
    lastActiveAt: null,
  };
}

function ensureProfile(userId: string) {
  const db = getDb();
  if (db.profiles.some((p) => p.userId === userId)) return;
  const zero = { arrays: 0, strings: 0, "binary-search": 0, graphs: 0, "dynamic-programming": 0, trees: 0, greedy: 0, "number-theory": 0 };
  db.profiles.push({
    userId,
    problemsSolved: 0,
    contestsAttended: 0,
    solvedByDifficulty: { easy: 0, medium: 0, hard: 0 },
    solvedByTopic: { ...zero },
    attemptedByTopic: { ...zero },
    ratingHistory: [],
    achievements: [],
  });
}

export const mockAdminService: AdminService = {
  async getOverview() {
    await latency();
    requireStaff();
    const db = getDb();
    const now = Date.now();
    const members = db.users.filter((u) => u.role === "member");
    const completed = db.submissions.filter((s) => s.status === "completed");
    const dayAgo = now - 24 * 60 * 60 * 1000;
    return clone({
      totalParticipants: members.length,
      activeParticipants: members.filter((u) => u.status === "active" && u.invitation === "accepted").length,
      pendingInvitations: db.users.filter((u) => u.invitation === "pending").length,
      activeContests: db.contests.filter((c) => getContestStatus(c, now) === "ongoing").length,
      upcomingContests: db.contests
        .filter((c) => ["draft", "scheduled", "upcoming"].includes(getContestStatus(c, now)))
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
      totalProblems: db.problems.length,
      totalSubmissions: db.submissions.length,
      submissionsToday: db.submissions.filter((s) => new Date(s.createdAt).getTime() > dayAgo).length,
      acceptanceRate: completed.length ? completed.filter((s) => s.verdict === "accepted").length / completed.length : 0,
      recentActivity: db.auditLogs.slice(0, 6),
    });
  },

  /* ---------------- Contests ---------------- */

  async getContests() {
    await latency();
    requireStaff();
    return clone([...getDb().contests].sort((a, b) => b.startsAt.localeCompare(a.startsAt)));
  },

  async getContest(id) {
    await latency(150);
    requireStaff();
    const contest = getDb().contests.find((c) => c.id === id);
    return contest ? clone(contest) : null;
  },

  async createContest(input) {
    await latency(500);
    const actor = requireStaff();
    const db = getDb();
    let id = slugify(input.title) || "contest";
    if (db.contests.some((c) => c.id === id)) id = `${id}-${db.counter + 1}`;
    const contest: Contest = { ...clone(input), id, registeredCount: 0, createdBy: actor.id, updatedAt: new Date().toISOString() };
    db.contests.push(contest);
    syncContestProblems(contest);
    audit(actor, input.lifecycle === "published" ? "contest.publish" : "contest.create", "contest", id, contest.title);
    persist();
    return clone(contest);
  },

  async updateContest(id, input) {
    await latency(450);
    const actor = requireStaff();
    const contest = findContest(id);
    const wasPublished = contest.lifecycle === "published";
    Object.assign(contest, clone(input), { updatedAt: new Date().toISOString() });
    syncContestProblems(contest);
    audit(actor, !wasPublished && input.lifecycle === "published" ? "contest.publish" : "contest.update", "contest", id, contest.title);
    persist();
    return clone(contest);
  },

  async setContestLifecycle(id, lifecycle) {
    await latency(350);
    const actor = requireStaff();
    const contest = findContest(id);
    contest.lifecycle = lifecycle;
    contest.updatedAt = new Date().toISOString();
    audit(actor, lifecycle === "archived" ? "contest.archive" : lifecycle === "published" ? "contest.publish" : "contest.update", "contest", id, contest.title, `Lifecycle → ${lifecycle}`);
    persist();
    return clone(contest);
  },

  /* ---------------- Problems & tests ---------------- */

  async getProblems() {
    await latency();
    requireStaff();
    return getDb().problems.map(toAdminProblem);
  },

  async getProblem(id) {
    await latency(150);
    requireStaff();
    const seed = getDb().problems.find((p) => p.id === id);
    return seed ? toAdminProblem(seed) : null;
  },

  async createProblem(input) {
    await latency(500);
    const actor = requireStaff();
    const db = getDb();
    const id = input.id.trim().toUpperCase();
    if (db.problems.some((p) => p.id === id)) throw new ServiceError(`Problem ID ${id} already exists.`, "conflict");
    const rest = withoutSamples(clone(input));
    const seed: ProblemSeed = { ...rest, id, testCases: rest.testCases.map((tc) => ({ ...tc, problemId: id })) };
    db.problems.push(seed);
    audit(actor, "problem.create", "problem", id, `${id} · ${seed.title}`);
    persist();
    return toAdminProblem(seed);
  },

  async updateProblem(id, input) {
    await latency(450);
    const actor = requireStaff();
    const db = getDb();
    const index = db.problems.findIndex((p) => p.id === id);
    if (index < 0) throw new ServiceError("Problem not found", "not_found");
    const rest = withoutSamples(clone(input));
    db.problems[index] = { ...rest, id, testCases: rest.testCases.map((tc) => ({ ...tc, problemId: id })) };
    audit(actor, "problem.update", "problem", id, `${id} · ${rest.title}`);
    persist();
    return toAdminProblem(db.problems[index]);
  },

  async saveTestCases(problemId, cases) {
    await latency(400);
    const actor = requireStaff();
    const seed = getDb().problems.find((p) => p.id === problemId);
    if (!seed) throw new ServiceError("Problem not found", "not_found");
    seed.testCases = clone(cases).map((tc) => ({ ...tc, problemId }));
    const hidden = seed.testCases.filter((t) => t.kind === "hidden").length;
    audit(actor, "testcase.update", "testcase", problemId, `${problemId} · ${seed.title}`, `${seed.testCases.length} cases (${hidden} hidden)`);
    persist();
    return clone(seed.testCases);
  },

  async validateTestCases(problemId) {
    await latency(900);
    requireStaff();
    const seed = getDb().problems.find((p) => p.id === problemId);
    if (!seed) throw new ServiceError("Problem not found", "not_found");
    const issues: TestCaseValidationIssue[] = [];
    if (!seed.testCases.some((t) => t.kind === "sample")) issues.push({ testCaseId: "-", level: "error", message: "At least one public sample is required." });
    if (!seed.testCases.some((t) => t.kind === "hidden")) issues.push({ testCaseId: "-", level: "warning", message: "No hidden tests: verdicts will only reflect the samples." });
    const seen = new Map<string, string>();
    for (const tc of seed.testCases) {
      if (!tc.input.trim()) issues.push({ testCaseId: tc.id, level: "error", message: `${tc.label}: input is empty.` });
      if (!tc.output.trim()) issues.push({ testCaseId: tc.id, level: "error", message: `${tc.label}: expected output is empty.` });
      if (/[ \t]+$/m.test(tc.output)) issues.push({ testCaseId: tc.id, level: "warning", message: `${tc.label}: output has trailing whitespace.` });
      if (tc.input.length > 1_000_000) issues.push({ testCaseId: tc.id, level: "warning", message: `${tc.label}: input is larger than 1 MB.` });
      const dup = seen.get(tc.input.trim());
      if (dup) issues.push({ testCaseId: tc.id, level: "warning", message: `${tc.label}: same input as ${dup}.` });
      seen.set(tc.input.trim(), tc.label);
    }
    return { problemId, ok: !issues.some((i) => i.level === "error"), checked: seed.testCases.length, issues, simulated: true as const };
  },

  /* ---------------- Users ---------------- */

  async getUsers() {
    await latency();
    requireStaff();
    const db = getDb();
    return clone(
      db.users.map((u) => {
        const p = db.profiles.find((x) => x.userId === u.id);
        return { ...u, contestsAttended: p?.contestsAttended ?? 0, problemsSolved: p?.problemsSolved ?? 0 };
      }),
    );
  },

  async inviteUser(input) {
    await latency(500);
    const actor = requireStaff();
    if (input.role !== "member" && actor.role !== "super_admin") throw new ServiceError("Only a Super Admin can invite staff accounts.", "forbidden");
    assertUniqueUser(input.email);
    const handle = input.email.split("@")[0].replace(/[^a-z0-9_.]/gi, "").slice(0, 20) || "member";
    const user = newUser({ ...input, handle, batch: "—" }, "pending");
    getDb().users.push(user);
    ensureProfile(user.id);
    audit(actor, "user.invite", "user", user.id, user.handle, `Invited as ${input.role}`);
    persist();
    return clone(user);
  },

  async createUser(input) {
    await latency(500);
    const actor = requireStaff();
    if (input.role !== "member" && actor.role !== "super_admin") throw new ServiceError("Only a Super Admin can create staff accounts.", "forbidden");
    assertUniqueUser(input.email, input.handle);
    const user = newUser(input, "accepted");
    getDb().users.push(user);
    ensureProfile(user.id);
    audit(actor, "user.create", "user", user.id, user.handle, `Created as ${input.role}`);
    persist();
    return clone(user);
  },

  async importUsers(rows) {
    await latency(700);
    const actor = requireStaff();
    const created: User[] = [];
    for (const row of rows) {
      if (row.errors.length) continue;
      try {
        assertUniqueUser(row.email, row.handle);
      } catch {
        continue;
      }
      const user = newUser({ email: row.email, name: row.name, handle: row.handle, role: "member", batch: row.batch }, "pending");
      getDb().users.push(user);
      ensureProfile(user.id);
      created.push(user);
    }
    if (created.length) audit(actor, "user.invite", "user", created[0].id, `${created.length} users`, "CSV import");
    persist();
    return clone(created);
  },

  async updateUserRole(id, role) {
    await latency(350);
    const actor = requireRole("super_admin");
    const user = findUser(id);
    if (user.id === actor.id) throw new ServiceError("You cannot change your own role.", "forbidden");
    const before = user.role;
    user.role = role;
    audit(actor, "user.role_change", "user", id, user.handle, `${before} → ${role}`);
    persist();
    return clone(user);
  },

  async setUserStatus(id, status) {
    await latency(350);
    const actor = requireStaff();
    const user = findUser(id);
    if (user.id === actor.id) throw new ServiceError("You cannot deactivate your own account.", "forbidden");
    if (user.role !== "member" && actor.role !== "super_admin") throw new ServiceError("Only a Super Admin can change staff accounts.", "forbidden");
    user.status = status;
    audit(actor, status === "active" ? "user.reactivate" : "user.deactivate", "user", id, user.handle);
    persist();
    return clone(user);
  },

  /* ---------------- Submissions ---------------- */

  async getSubmissions(filters = {}) {
    await latency();
    requireStaff();
    return clone(
      getDb()
        .submissions.filter((s) => !filters.userId || s.userId === filters.userId)
        .filter((s) => !filters.problemId || s.problemId === filters.problemId)
        .filter((s) => !filters.verdict || s.verdict === filters.verdict)
        .filter((s) => !filters.language || s.language === filters.language)
        .filter((s) => (!filters.contestId ? true : filters.contestId === "practice" ? s.kind === "practice" : s.contestId === filters.contestId))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async rejudgeSubmission(id, outcome = "keep") {
    await latency(300);
    const actor = requireStaff();
    const db = getDb();
    const submission = db.submissions.find((s) => s.id === id);
    if (!submission) throw new ServiceError("Submission not found", "not_found");
    if (submission.status !== "completed") throw new ServiceError("This submission is still being judged.", "conflict");
    const seed = db.problems.find((p) => p.id === submission.problemId);
    if (!seed) throw new ServiceError("Problem not found", "not_found");
    const target = outcome === "keep" ? (submission.verdict ?? "auto") : outcome;
    const plan = planVerdict(submission.source, submission.language, seed.testCases, seed, target);
    const before = submission.verdict;
    Object.assign(submission, { status: "queued", verdict: null, passedTests: null, timeMs: null, memoryKb: null, failedTest: null, rejudged: true });
    startJudging(submission, plan);
    audit(actor, "submission.rejudge", "submission", id, id, `${before ?? "pending"} → ${plan.verdict} (simulated)`);
    persist();
    return clone(submission);
  },

  /* ---------------- Announcements & audit ---------------- */

  async getAnnouncements() {
    await latency();
    requireStaff();
    return clone([...getDb().announcements].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },

  async createAnnouncement(input) {
    await latency(400);
    const actor = requireStaff();
    const now = new Date().toISOString();
    const announcement = { ...clone(input), id: nextId("a-"), authorId: actor.id, createdAt: now, updatedAt: now };
    const db = getDb();
    db.announcements.unshift(announcement);
    if (input.published) {
      // Fan out an in-app notification to active members (no email is sent).
      db.users
        .filter((u) => u.status === "active" && u.id !== actor.id)
        .forEach((u) =>
          db.notifications.unshift({
            id: nextId("n-"),
            userId: u.id,
            type: "announcement",
            title: input.title,
            body: input.body.slice(0, 140),
            href: input.contestId ? `/contests/${input.contestId}` : "/dashboard",
            createdAt: now,
            read: false,
          }),
        );
    }
    audit(actor, input.published ? "announcement.publish" : "announcement.update", "announcement", announcement.id, input.title);
    persist();
    return clone(announcement);
  },

  async updateAnnouncement(id, input) {
    await latency(350);
    const actor = requireStaff();
    const a = getDb().announcements.find((x) => x.id === id);
    if (!a) throw new ServiceError("Announcement not found", "not_found");
    Object.assign(a, clone(input), { updatedAt: new Date().toISOString() });
    audit(actor, "announcement.update", "announcement", id, a.title);
    persist();
    return clone(a);
  },

  async deleteAnnouncement(id) {
    await latency(300);
    const actor = requireStaff();
    const db = getDb();
    const a = db.announcements.find((x) => x.id === id);
    if (!a) throw new ServiceError("Announcement not found", "not_found");
    db.announcements = db.announcements.filter((x) => x.id !== id);
    audit(actor, "announcement.delete", "announcement", id, a.title);
    persist();
  },

  async getAuditLogs() {
    await latency();
    requireStaff();
    return clone(getDb().auditLogs);
  },
};
