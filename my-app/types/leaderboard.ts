import type { UserSummary } from "./user";
import type { Verdict } from "./submission";

/** Compact judge event used for standings: one per submission. */
export interface JudgeEvent {
  userId: string;
  problemId: string;
  /** Minutes elapsed since contest start. */
  minute: number;
  verdict: Verdict;
  submissionId?: string;
}

export interface ProblemResult {
  problemId: string;
  solved: boolean;
  /** Minute of the first accepted submission within the contest window. */
  solvedAtMinute: number | null;
  /** Rejected attempts before the first AC (or all, when unsolved). */
  rejectedAttempts: number;
  /** Penalty minutes contributed by this problem (0 if unsolved). */
  penalty: number;
  firstToSolve: boolean;
  /** Accepted after the deadline: shown, never counted. */
  acceptedAfterDeadline: boolean;
  pending: boolean;
}

export interface StandingRow {
  rank: number;
  participant: UserSummary;
  solved: number;
  penalty: number;
  lastAcceptedMinute: number | null;
  results: Record<string, ProblemResult>;
}

export interface ContestStandings {
  contestId: string;
  state: "provisional" | "final" | "not-started";
  problemIds: string[];
  rows: StandingRow[];
  generatedAt: string;
}

export interface DepartmentRow {
  rank: number;
  previousRank: number;
  participant: UserSummary;
  rating: number;
  problemsSolved: number;
  contestsAttended: number;
  points: number;
}
