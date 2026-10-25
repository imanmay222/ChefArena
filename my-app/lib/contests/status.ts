import type { Contest, ContestStatus } from "@/types";

const MINUTE = 60_000;
/** Published contests starting within this window are "upcoming"; later ones are "scheduled". */
export const UPCOMING_WINDOW_MS = 7 * 24 * 60 * MINUTE;

export function contestStartMs(contest: Pick<Contest, "startsAt">) {
  return new Date(contest.startsAt).getTime();
}

export function contestEndMs(contest: Pick<Contest, "startsAt" | "durationMinutes">) {
  return contestStartMs(contest) + contest.durationMinutes * MINUTE;
}

/** Single source of truth for contest status, used by every screen. */
export function getContestStatus(contest: Contest, now: number): ContestStatus {
  if (contest.lifecycle === "draft") return "draft";
  if (contest.lifecycle === "archived") return "archived";
  const start = contestStartMs(contest);
  const end = contestEndMs(contest);
  if (now < start) return start - now > UPCOMING_WINDOW_MS ? "scheduled" : "upcoming";
  if (now < end) return "ongoing";
  return "ended";
}

/** Coarse phase used for member-facing tabs. */
export type ContestPhase = "upcoming" | "ongoing" | "past";

export function getContestPhase(status: ContestStatus): ContestPhase | null {
  if (status === "scheduled" || status === "upcoming") return "upcoming";
  if (status === "ongoing") return "ongoing";
  if (status === "ended" || status === "archived") return "past";
  return null;
}

export function elapsedContestMinutes(contest: Contest, now: number) {
  return Math.max(0, Math.floor((now - contestStartMs(contest)) / MINUTE));
}

export const CONTEST_STATUS_LABEL: Record<ContestStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  upcoming: "Upcoming",
  ongoing: "Live",
  ended: "Ended",
  archived: "Archived",
};
