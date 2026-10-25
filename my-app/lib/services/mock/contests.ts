import type { ContestService } from "@/lib/services/contracts";
import { clone, getDb, latency } from "./db";
import { requireUser } from "./session";

const byStart = (a: { startsAt: string }, b: { startsAt: string }) => a.startsAt.localeCompare(b.startsAt);

export const mockContestService: ContestService = {
  async getContests() {
    await latency();
    requireUser();
    return clone(getDb().contests.filter((c) => c.lifecycle !== "draft").sort(byStart));
  },

  async getContestById(id) {
    await latency(160);
    requireUser();
    const contest = getDb().contests.find((c) => c.id === id && c.lifecycle !== "draft");
    return contest ? clone(contest) : null;
  },
};
