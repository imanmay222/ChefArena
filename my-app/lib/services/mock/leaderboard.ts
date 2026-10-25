import type { LeaderboardService } from "@/lib/services/contracts";
import { ServiceError } from "@/lib/services/errors";
import { getDb, latency } from "./db";
import { requireUser } from "./session";
import { buildDepartmentLeaderboard, buildStandings } from "./standings";

export const mockLeaderboardService: LeaderboardService = {
  async getContestStandings(contestId) {
    await latency();
    requireUser();
    const db = getDb();
    const contest = db.contests.find((c) => c.id === contestId && c.lifecycle !== "draft");
    if (!contest) throw new ServiceError("Contest not found", "not_found");
    return buildStandings(db, contest, Date.now());
  },

  async getDepartmentLeaderboard() {
    await latency();
    requireUser();
    return buildDepartmentLeaderboard(getDb(), Date.now());
  },
};
