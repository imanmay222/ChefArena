import type { Topic } from "./user";

export type Difficulty = "easy" | "medium" | "hard";
export type Language = "cpp" | "java" | "python" | "go";

export interface SampleCase {
  id: string;
  input: string;
  output: string;
  explanation?: string;
}

/** Public problem DTO — never contains hidden tests or reference solutions. */
export interface Problem {
  id: string;
  code: string;
  title: string;
  difficulty: Difficulty;
  points: number;
  topics: Topic[];
  statement: string[];
  inputFormat: string[];
  outputFormat: string[];
  constraints: string[];
  samples: SampleCase[];
  notes?: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  languages: Language[];
  contestId: string | null;
  author: string;
  solvedCount: number;
  attemptCount: number;
  published: boolean;
  /** Only present once the problem's contest has ended. */
  editorial?: string;
}

export type TestCaseKind = "sample" | "hidden";

export interface TestCase {
  id: string;
  problemId: string;
  label: string;
  kind: TestCaseKind;
  input: string;
  output: string;
  inputFileName?: string;
  outputFileName?: string;
  weight: number;
  explanation?: string;
}

/** Admin-only view of a problem, including judge material. */
export interface AdminProblem extends Problem {
  testCases: TestCase[];
  referenceSolution: { language: Language; source: string };
  editorial: string;
}

export type ProblemInput = Omit<AdminProblem, "solvedCount" | "attemptCount" | "samples"> & {
  samples?: SampleCase[];
};

export type SolveState = "solved" | "attempted" | "unsolved";

/** Problem row as listed for the current user. */
export interface ProblemListItem {
  problem: Problem;
  state: SolveState;
  locked: boolean;
  lockReason?: string;
  contestTitle?: string;
}

export interface TestCaseValidationIssue {
  testCaseId: string;
  level: "error" | "warning";
  message: string;
}

export interface TestCaseValidationReport {
  problemId: string;
  ok: boolean;
  checked: number;
  issues: TestCaseValidationIssue[];
  simulated: true;
}
