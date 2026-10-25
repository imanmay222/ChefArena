import type {
  AdminOverview,
  AdminProblem,
  AdminUser,
  Announcement,
  AnnouncementInput,
  AppNotification,
  AuditEvent,
  Contest,
  ContestInput,
  ContestLifecycle,
  ContestStandings,
  CreateSubmissionInput,
  CreateUserInput,
  CsvImportRow,
  DepartmentRow,
  InviteUserInput,
  Language,
  ProblemInput,
  ProblemListItem,
  ProfileStats,
  Role,
  AccountStatus,
  RunResult,
  Submission,
  SubmissionFilters,
  SubmissionUpdate,
  TestCase,
  TestCaseValidationReport,
  User,
  Verdict,
} from "@/types";

/**
 * Service contracts shared by the mock adapter (lib/services/mock) and the
 * future HTTP adapter for the Go API. Components and hooks depend on these
 * interfaces only — never on mock data.
 */

export interface LoginInput {
  identifier: string;
  password: string;
  remember: boolean;
}

export interface AuthService {
  login(input: LoginInput): Promise<User>;
  logout(): Promise<void>;
  /** Resolves the user for the current session, or null when signed out. */
  getCurrentUser(): Promise<User | null>;
  requestPasswordReset(identifier: string): Promise<void>;
}

export interface ContestService {
  /** Contests visible to the current user (members never see drafts). */
  getContests(): Promise<Contest[]>;
  getContestById(id: string): Promise<Contest | null>;
}

export interface ProblemService {
  /** Practice archive for the current user, including solve state and lock info. */
  getProblems(): Promise<ProblemListItem[]>;
  /** Problems of a contest; empty until the contest starts. */
  getContestProblems(contestId: string): Promise<ProblemListItem[]>;
  getProblemById(id: string): Promise<ProblemListItem | null>;
}

export interface SubmissionService {
  /** Runs code against public samples only. */
  runCode(input: { problemId: string; language: Language; source: string }): Promise<RunResult>;
  createSubmission(input: CreateSubmissionInput): Promise<Submission>;
  /** Streams status updates (WebSocket in production). Returns an unsubscribe function. */
  watchSubmission(id: string, onUpdate: (update: SubmissionUpdate) => void): () => void;
  /** The current user's own submissions. */
  getSubmissions(filters?: SubmissionFilters): Promise<Submission[]>;
}

export interface LeaderboardService {
  getContestStandings(contestId: string): Promise<ContestStandings>;
  getDepartmentLeaderboard(): Promise<DepartmentRow[]>;
}

export interface ProfileService {
  getProfile(userId?: string): Promise<{ user: User; stats: ProfileStats } | null>;
}

export interface NotificationService {
  getNotifications(): Promise<AppNotification[]>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
  getAnnouncements(params?: { contestId?: string }): Promise<Announcement[]>;
}

export interface AdminService {
  getOverview(): Promise<AdminOverview>;

  getContests(): Promise<Contest[]>;
  getContest(id: string): Promise<Contest | null>;
  createContest(input: ContestInput): Promise<Contest>;
  updateContest(id: string, input: ContestInput): Promise<Contest>;
  setContestLifecycle(id: string, lifecycle: ContestLifecycle): Promise<Contest>;

  getProblems(): Promise<AdminProblem[]>;
  getProblem(id: string): Promise<AdminProblem | null>;
  createProblem(input: ProblemInput): Promise<AdminProblem>;
  updateProblem(id: string, input: ProblemInput): Promise<AdminProblem>;
  saveTestCases(problemId: string, cases: TestCase[]): Promise<TestCase[]>;
  validateTestCases(problemId: string): Promise<TestCaseValidationReport>;

  getUsers(): Promise<AdminUser[]>;
  inviteUser(input: InviteUserInput): Promise<User>;
  createUser(input: CreateUserInput): Promise<User>;
  importUsers(rows: CsvImportRow[]): Promise<User[]>;
  updateUserRole(id: string, role: Role): Promise<User>;
  setUserStatus(id: string, status: AccountStatus): Promise<User>;

  getSubmissions(filters?: SubmissionFilters): Promise<Submission[]>;
  rejudgeSubmission(id: string, outcome?: Verdict | "keep"): Promise<Submission>;

  getAnnouncements(): Promise<Announcement[]>;
  createAnnouncement(input: AnnouncementInput): Promise<Announcement>;
  updateAnnouncement(id: string, input: AnnouncementInput): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<void>;

  getAuditLogs(): Promise<AuditEvent[]>;
}

export interface Services {
  auth: AuthService;
  contests: ContestService;
  problems: ProblemService;
  submissions: SubmissionService;
  leaderboard: LeaderboardService;
  profiles: ProfileService;
  notifications: NotificationService;
  admin: AdminService;
}
