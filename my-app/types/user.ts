export type Role = "member" | "cp_lead" | "super_admin";
export type AccountStatus = "active" | "deactivated";
export type InvitationStatus = "accepted" | "pending" | "expired";

export interface User {
  id: string;
  handle: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  batch: string;
  rating: number;
  maxRating: number;
  status: AccountStatus;
  invitation: InvitationStatus;
  joinedAt: string;
  lastActiveAt: string | null;
}

/** Narrow public view of a user, safe to show anywhere. */
export type UserSummary = Pick<User, "id" | "handle" | "name" | "rating" | "department">;

export type Topic =
  | "arrays"
  | "strings"
  | "binary-search"
  | "graphs"
  | "dynamic-programming"
  | "trees"
  | "greedy"
  | "number-theory";

export interface RatingPoint {
  contestId: string;
  contestTitle: string;
  date: string;
  rating: number;
  rank: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "flame" | "zap" | "trophy" | "target" | "medal" | "sparkles";
  earnedAt: string | null;
  progress?: { current: number; target: number };
}

/** Aggregates the backend would compute; the mock adapter keeps them in sync with accepted submissions. */
export interface ProfileStats {
  userId: string;
  problemsSolved: number;
  contestsAttended: number;
  departmentRank: number;
  solvedByDifficulty: Record<"easy" | "medium" | "hard", number>;
  solvedByTopic: Record<Topic, number>;
  attemptedByTopic: Record<Topic, number>;
  ratingHistory: RatingPoint[];
  achievements: Achievement[];
}
