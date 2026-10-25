import type { JudgeEvent } from "@/types";

/**
 * Compact rival attempts used to build ICPC standings. Each tuple is one
 * submission: [userId, problemId, minute, verdict]. Attempts that already
 * exist as full records in submissions.ts are NOT repeated here — the mock
 * adapter merges both sources.
 */
type Tuple = [string, string, number, JudgeEvent["verdict"]];

const toEvents = (rows: Tuple[]): JudgeEvent[] =>
  rows.map(([userId, problemId, minute, verdict]) => ({ userId, problemId, minute, verdict }));

export const seedJudgeEvents: Record<string, JudgeEvent[]> = {
  "weekly-41": toEvents([
    ["u_sneha", "CA101", 6, "accepted"],
    ["u_sneha", "CA102", 30, "wrong_answer"],
    ["u_sneha", "CA102", 44, "accepted"],
    ["u_sneha", "CA103", 112, "accepted"],
    ["u_rohan", "CA101", 11, "accepted"],
    ["u_rohan", "CA102", 52, "accepted"],
    ["u_rohan", "CA103", 98, "wrong_answer"],
    ["u_rohan", "CA103", 120, "time_limit_exceeded"],
    ["u_rohan", "CA103", 141, "accepted"],
    ["u_ananya", "CA101", 8, "accepted"],
    ["u_ananya", "CA102", 39, "accepted"],
    ["u_ananya", "CA103", 152, "accepted"], // after the 150-minute deadline: not counted
    ["u_meera", "CA101", 18, "accepted"],
    ["u_meera", "CA101", 25, "wrong_answer"], // after solving: no penalty
    ["u_meera", "CA102", 71, "accepted"],
    ["u_vikram", "CA101", 22, "accepted"],
    ["u_vikram", "CA102", 60, "wrong_answer"],
    ["u_vikram", "CA102", 75, "wrong_answer"],
    ["u_ishaan", "CA101", 15, "wrong_answer"],
    ["u_ishaan", "CA101", 35, "accepted"],
    ["u_diya", "CA101", 40, "accepted"],
    ["u_diya", "CA102", 140, "runtime_error"],
  ]),
  "weekly-42": toEvents([
    ["u_rohan", "CA104", 22, "accepted"],
    ["u_ananya", "CA104", 10, "accepted"],
    ["u_ananya", "CA106", 30, "wrong_answer"],
    ["u_meera", "CA104", 19, "wrong_answer"],
    ["u_ishaan", "CA104", 33, "accepted"],
    ["u_diya", "CA105", 25, "wrong_answer"],
    ["u_diya", "CA105", 36, "accepted"],
  ]),
};

/** Department points earned this season before Weekly #41 (contests #30–#40). */
export const seedSeasonBaseline: Record<string, number> = {
  u_member: 1180,
  u_sneha: 1420,
  u_rohan: 1265,
  u_ananya: 1105,
  u_meera: 1010,
  u_vikram: 890,
  u_ishaan: 410,
  u_diya: 380,
};
