import type { Achievement, ProfileStats, Topic } from "@/types";
import type { Timeline } from "./timeline";

export type ProfileSeed = Omit<ProfileStats, "departmentRank">;

const TOPICS: Topic[] = ["arrays", "strings", "binary-search", "graphs", "dynamic-programming", "trees", "greedy", "number-theory"];
const topicMap = (values: number[] = []): Record<Topic, number> =>
  Object.fromEntries(TOPICS.map((topic, i) => [topic, values[i] ?? 0])) as Record<Topic, number>;

/**
 * Lifetime aggregates as a backend profile endpoint would return them. The
 * mock adapter increments them when a simulated submission is accepted for a
 * problem the user had not solved before.
 */
export function seedProfiles(t: Timeline): ProfileSeed[] {
  const memberAchievements: Achievement[] = [
    { id: "ach-first-blood", title: "First Blood", description: "First to solve a problem in a weekly contest", icon: "zap", earnedAt: t.daysAgo(41) },
    { id: "ach-podium", title: "Podium Finish", description: "Finish in the top three of a weekly contest", icon: "trophy", earnedAt: t.daysAgo(21) },
    { id: "ach-polyglot", title: "Polyglot", description: "Get accepted in three different languages", icon: "sparkles", earnedAt: t.daysAgo(3) },
    { id: "ach-streak", title: "Seven-Day Streak", description: "Solve at least one problem seven days in a row", icon: "flame", earnedAt: t.daysAgo(12) },
    { id: "ach-century", title: "Century", description: "Solve 100 problems on ChefArena", icon: "target", earnedAt: null, progress: { current: 87, target: 100 } },
    { id: "ach-graph", title: "Graph Walker", description: "Solve 15 graph problems", icon: "medal", earnedAt: null, progress: { current: 8, target: 15 } },
  ];

  const blank = (userId: string, problemsSolved: number, contestsAttended: number): ProfileSeed => ({
    userId,
    problemsSolved,
    contestsAttended,
    solvedByDifficulty: { easy: 0, medium: 0, hard: 0 },
    solvedByTopic: topicMap(),
    attemptedByTopic: topicMap(),
    ratingHistory: [],
    achievements: [],
  });

  return [
    {
      userId: "u_member",
      problemsSolved: 87,
      contestsAttended: 23,
      solvedByDifficulty: { easy: 41, medium: 34, hard: 12 },
      solvedByTopic: topicMap([24, 12, 9, 8, 11, 6, 13, 4]),
      attemptedByTopic: topicMap([27, 15, 11, 13, 17, 9, 15, 7]),
      ratingHistory: [
        { contestId: "weekly-36", contestTitle: "Weekly #36", date: t.daysAgo(42), rating: 1534, rank: 5 },
        { contestId: "weekly-37", contestTitle: "Weekly #37", date: t.daysAgo(35), rating: 1588, rank: 3 },
        { contestId: "weekly-38", contestTitle: "Weekly #38", date: t.daysAgo(28), rating: 1668, rank: 1 },
        { contestId: "weekly-39", contestTitle: "Weekly #39", date: t.daysAgo(21), rating: 1611, rank: 4 },
        { contestId: "weekly-40", contestTitle: "Weekly #40", date: t.daysAgo(14), rating: 1620, rank: 6 },
        { contestId: "weekly-41", contestTitle: "Weekly #41", date: t.daysAgo(7), rating: 1642, rank: 5 },
      ],
      achievements: memberAchievements,
    },
    {
      ...blank("u_lead", 214, 0),
      solvedByDifficulty: { easy: 61, medium: 98, hard: 55 },
      solvedByTopic: topicMap([38, 26, 22, 34, 41, 21, 19, 13]),
      attemptedByTopic: topicMap([40, 29, 24, 39, 47, 24, 21, 16]),
      ratingHistory: [
        { contestId: "inter-1", contestTitle: "Inter-College #1", date: t.daysAgo(120), rating: 1902, rank: 4 },
        { contestId: "inter-2", contestTitle: "Inter-College #2", date: t.daysAgo(90), rating: 1955, rank: 2 },
        { contestId: "inter-3", contestTitle: "Inter-College #3", date: t.daysAgo(60), rating: 2031, rank: 1 },
        { contestId: "inter-4", contestTitle: "Inter-College #4", date: t.daysAgo(30), rating: 1984, rank: 3 },
      ],
      achievements: [memberAchievements[0], memberAchievements[1]].map((a) => ({ ...a, earnedAt: t.daysAgo(200) })),
    },
    blank("u_admin", 0, 0),
    blank("u_sneha", 112, 26),
    blank("u_rohan", 98, 25),
    blank("u_ananya", 79, 21),
    blank("u_meera", 71, 22),
    blank("u_vikram", 58, 19),
    blank("u_ishaan", 24, 8),
    blank("u_diya", 19, 6),
  ];
}
