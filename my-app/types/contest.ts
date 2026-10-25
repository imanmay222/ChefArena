/** Lifecycle chosen by admins. Time-based phases are derived from it. */
export type ContestLifecycle = "draft" | "published" | "archived";

/** Display status shown in the UI. See lib/contests/status.ts. */
export type ContestStatus = "draft" | "scheduled" | "upcoming" | "ongoing" | "ended" | "archived";

export type ContestVisibility = "department" | "invite-only";

export interface ScoringConfig {
  format: "ICPC";
  penaltyMinutes: number;
  /** Compilation errors are not penalised in most ICPC rule sets. */
  penalizeCompilationError: boolean;
  /** Minutes before the end when the public board freezes (0 = no freeze). */
  freezeMinutes: number;
}

export interface Contest {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  rules: string[];
  startsAt: string;
  durationMinutes: number;
  problemIds: string[];
  scoring: ScoringConfig;
  visibility: ContestVisibility;
  lifecycle: ContestLifecycle;
  registeredCount: number;
  createdBy: string;
  updatedAt: string;
}

export type ContestInput = Omit<Contest, "id" | "registeredCount" | "createdBy" | "updatedAt">;
