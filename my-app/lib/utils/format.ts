import { format, formatDistanceStrict } from "date-fns";
import type { Difficulty, Topic, Verdict } from "@/types";

/** All dates are ISO-8601 strings in UTC; they are formatted in the viewer's locale/time zone. */
export const fmtDate = (iso: string) => format(new Date(iso), "d MMM yyyy");
export const fmtDateTime = (iso: string) => format(new Date(iso), "d MMM yyyy, HH:mm");
export const fmtShortDateTime = (iso: string) => format(new Date(iso), "EEE d MMM, HH:mm");
export const fmtTime = (iso: string) => format(new Date(iso), "HH:mm");
export const fmtRelative = (iso: string, now: number) =>
  formatDistanceStrict(new Date(iso), new Date(now), { addSuffix: true });

export function fmtDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** 00:14 style contest clock for penalties and solve times. */
export function fmtClock(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function fmtCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m` : `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function splitCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export const fmtMemory = (kb: number | null) =>
  kb == null ? "—" : kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
export const fmtRuntime = (ms: number | null) => (ms == null ? "—" : `${ms} ms`);

export const VERDICT_META: Record<Verdict, { label: string; short: string; tone: "success" | "destructive" | "warning" | "info" }> = {
  accepted: { label: "Accepted", short: "AC", tone: "success" },
  wrong_answer: { label: "Wrong Answer", short: "WA", tone: "destructive" },
  time_limit_exceeded: { label: "Time Limit Exceeded", short: "TLE", tone: "warning" },
  memory_limit_exceeded: { label: "Memory Limit Exceeded", short: "MLE", tone: "warning" },
  runtime_error: { label: "Runtime Error", short: "RE", tone: "destructive" },
  compilation_error: { label: "Compilation Error", short: "CE", tone: "info" },
};

export const DIFFICULTY_META: Record<Difficulty, { label: string; className: string }> = {
  easy: { label: "Easy", className: "text-success" },
  medium: { label: "Medium", className: "text-warning" },
  hard: { label: "Hard", className: "text-destructive" },
};

export const TOPIC_LABEL: Record<Topic, string> = {
  arrays: "Arrays",
  strings: "Strings",
  "binary-search": "Binary Search",
  graphs: "Graphs",
  "dynamic-programming": "Dynamic Programming",
  trees: "Trees",
  greedy: "Greedy",
  "number-theory": "Number Theory",
};

export const TOPICS = Object.keys(TOPIC_LABEL) as Topic[];

/** Rating tiers, loosely modelled on common CP colour bands. */
export function ratingTier(rating: number) {
  if (rating <= 0) return { label: "Unrated", className: "text-muted-foreground" };
  if (rating < 1400) return { label: "Newbie", className: "text-muted-foreground" };
  if (rating < 1600) return { label: "Specialist", className: "text-info" };
  if (rating < 1800) return { label: "Expert", className: "text-primary" };
  if (rating < 2000) return { label: "Candidate Master", className: "text-brand-2" };
  return { label: "Master", className: "text-warning" };
}

export function greeting(hour: number) {
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
