import type { Services } from "@/lib/services/contracts";
import { mockAuthService } from "./auth";
import { mockContestService } from "./contests";
import { mockProblemService } from "./problems";
import { mockSubmissionService } from "./submissions";
import { mockLeaderboardService } from "./leaderboard";
import { mockProfileService } from "./profiles";
import { mockNotificationService } from "./notifications";
import { mockAdminService } from "./admin";

export { resetMockDb } from "./db";

export const mockServices: Services = {
  auth: mockAuthService,
  contests: mockContestService,
  problems: mockProblemService,
  submissions: mockSubmissionService,
  leaderboard: mockLeaderboardService,
  profiles: mockProfileService,
  notifications: mockNotificationService,
  admin: mockAdminService,
};
