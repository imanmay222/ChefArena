/**
 * All mock timestamps are relative to one anchor (the moment the demo data is
 * seeded) so the dataset always contains one completed, one live and one
 * upcoming contest, regardless of when the app is opened.
 */
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export interface Timeline {
  anchor: number;
  /** Weekly #41 — finished one week ago. */
  c41Start: number;
  /** Weekly #42 — currently live. */
  c42Start: number;
  /** Weekly #43 — next week. */
  c43Start: number;
  iso(ms: number): string;
  daysAgo(days: number, hours?: number): string;
  contestMinute(start: number, minute: number): string;
}

export function createTimeline(anchor: number): Timeline {
  // Live contest started ~40 minutes ago, aligned to a 5-minute boundary.
  const c42Start = Math.floor((anchor - 40 * MINUTE) / (5 * MINUTE)) * 5 * MINUTE;
  return {
    anchor,
    c41Start: c42Start - 7 * DAY,
    c42Start,
    c43Start: c42Start + 7 * DAY,
    iso: (ms) => new Date(ms).toISOString(),
    daysAgo: (days, hours = 0) => new Date(anchor - days * DAY - hours * HOUR).toISOString(),
    contestMinute: (start, minute) => new Date(start + minute * MINUTE).toISOString(),
  };
}

export const DEMO_TIME = { MINUTE, HOUR, DAY };
