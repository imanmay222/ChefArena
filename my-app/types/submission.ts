import type { Language } from "./problem";

export type Verdict =
  | "accepted"
  | "wrong_answer"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "runtime_error"
  | "compilation_error";

export type SubmissionStatus = "queued" | "compiling" | "running" | "completed";

export type SubmissionKind = "contest" | "practice";

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  contestId: string | null;
  kind: SubmissionKind;
  language: Language;
  source: string;
  status: SubmissionStatus;
  verdict: Verdict | null;
  /** Elapsed contest minutes at submission time (contest submissions only). */
  contestMinute: number | null;
  createdAt: string;
  timeMs: number | null;
  memoryKb: number | null;
  passedTests: number | null;
  totalTests: number | null;
  /** Index of the first failed hidden test, if any. */
  failedTest: number | null;
  compileOutput?: string;
  rejudged?: boolean;
}

export interface SubmissionUpdate {
  id: string;
  status: SubmissionStatus;
  verdict: Verdict | null;
  passedTests: number | null;
  totalTests: number | null;
  submission: Submission;
}

export interface CreateSubmissionInput {
  problemId: string;
  contestId: string | null;
  language: Language;
  source: string;
  /** Mock-only override used by the simulation controls. */
  simulateVerdict?: Verdict | "auto";
}

export interface RunResultCase {
  sampleId: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  timeMs: number;
}

export interface RunResult {
  status: "ok" | "compilation_error";
  compileOutput?: string;
  cases: RunResultCase[];
  simulated: true;
}

export interface SubmissionFilters {
  userId?: string;
  contestId?: string | "practice";
  problemId?: string;
  verdict?: Verdict;
  language?: Language;
}
