import type { ProfileService } from "@/lib/services/contracts";
import { clone, getDb, latency } from "./db";
import { requireUser } from "./session";
import { buildDepartmentLeaderboard } from "./standings";

export const mockProfileService: ProfileService = {
  async getProfile(userId) {
    await latency();
    const me = requireUser();
    const db = getDb();
    const user = db.users.find((u) => u.id === (userId ?? me.id));
    const profile = db.profiles.find((p) => p.userId === user?.id);
    if (!user || !profile) return null;
    const rank = buildDepartmentLeaderboard(db, Date.now()).find((r) => r.participant.id === user.id)?.rank ?? 0;
    return { user: clone(user), stats: { ...clone(profile), departmentRank: rank } };
  },
};
