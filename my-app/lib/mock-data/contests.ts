import type { Contest, ScoringConfig } from "@/types";
import type { Timeline } from "./timeline";

export const DEFAULT_SCORING: ScoringConfig = {
  format: "ICPC",
  penaltyMinutes: 20,
  penalizeCompilationError: false,
  freezeMinutes: 0,
};

const RULES = [
  "Individual participation only. Discussing problems during the contest is not allowed.",
  "Problems are ranked ICPC-style: more solved problems first, then lower total penalty.",
  "Each rejected submission before the first accepted one adds 20 penalty minutes. Compilation errors are not penalised.",
  "Accepted submissions after the contest deadline are not counted.",
  "Any language among C++, Java, Python and Go may be used. Standard input and output only.",
];

export function seedContests(t: Timeline): Contest[] {
  return [
    {
      id: "weekly-41",
      title: "ChefArena Weekly #41",
      shortTitle: "Weekly #41",
      description:
        "A balanced warm-up round covering prefix sums, greedy scheduling and DAG longest paths. Editorials are available for all three problems.",
      rules: RULES,
      startsAt: t.iso(t.c41Start),
      durationMinutes: 150,
      problemIds: ["CA101", "CA102", "CA103"],
      scoring: DEFAULT_SCORING,
      visibility: "department",
      lifecycle: "published",
      registeredCount: 8,
      createdBy: "u_lead",
      updatedAt: t.daysAgo(8),
    },
    {
      id: "weekly-42",
      title: "ChefArena Weekly #42",
      shortTitle: "Weekly #42",
      description:
        "Three problems, three hours. Binary search on sorted readings, a palindromic string DP and a classic tree DP. Good luck, and read the constraints carefully.",
      rules: RULES,
      startsAt: t.iso(t.c42Start),
      durationMinutes: 180,
      problemIds: ["CA104", "CA105", "CA106"],
      scoring: DEFAULT_SCORING,
      visibility: "department",
      lifecycle: "published",
      registeredCount: 8,
      createdBy: "u_lead",
      updatedAt: t.daysAgo(2),
    },
    {
      id: "weekly-43",
      title: "ChefArena Weekly #43",
      shortTitle: "Weekly #43",
      description:
        "Number theory special. Problems are revealed when the contest starts. Brush up on modular arithmetic and sieves.",
      rules: RULES,
      startsAt: t.iso(t.c43Start),
      durationMinutes: 150,
      problemIds: [],
      scoring: DEFAULT_SCORING,
      visibility: "department",
      lifecycle: "published",
      registeredCount: 5,
      createdBy: "u_lead",
      updatedAt: t.daysAgo(1),
    },
  ];
}
