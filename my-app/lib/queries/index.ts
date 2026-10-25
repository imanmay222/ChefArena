"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { services } from "@/lib/services";
import type { LoginInput } from "@/lib/services/contracts";
import { errorMessage } from "@/lib/services/errors";
import type {
  AccountStatus,
  AnnouncementInput,
  ContestInput,
  ContestLifecycle,
  CreateSubmissionInput,
  CreateUserInput,
  CsvImportRow,
  InviteUserInput,
  ProblemInput,
  Role,
  SubmissionFilters,
  TestCase,
  Verdict,
} from "@/types";

/** Centralised query keys so mutations can invalidate precisely. */
export const qk = {
  me: ["me"] as const,
  contests: ["contests"] as const,
  contest: (id: string) => ["contests", id] as const,
  problems: ["problems"] as const,
  contestProblems: (id: string) => ["problems", "contest", id] as const,
  problem: (id: string) => ["problems", "detail", id] as const,
  submissions: (filters?: SubmissionFilters) => ["submissions", filters ?? {}] as const,
  standings: (id: string) => ["standings", id] as const,
  department: ["department"] as const,
  profile: (id?: string) => ["profile", id ?? "me"] as const,
  notifications: ["notifications"] as const,
  announcements: (contestId?: string) => ["announcements", contestId ?? "all"] as const,
  admin: {
    all: ["admin"] as const,
    overview: ["admin", "overview"] as const,
    contests: ["admin", "contests"] as const,
    contest: (id: string) => ["admin", "contests", id] as const,
    problems: ["admin", "problems"] as const,
    problem: (id: string) => ["admin", "problems", id] as const,
    users: ["admin", "users"] as const,
    submissions: (f?: SubmissionFilters) => ["admin", "submissions", f ?? {}] as const,
    announcements: ["admin", "announcements"] as const,
    audit: ["admin", "audit"] as const,
  },
};

/* ---------------- Session ---------------- */

export const useCurrentUser = () =>
  useQuery({ queryKey: qk.me, queryFn: () => services.auth.getCurrentUser(), staleTime: 5 * 60_000 });

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => services.auth.login(input),
    onSuccess: (user) => {
      qc.clear();
      qc.setQueryData(qk.me, user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => services.auth.logout(),
    onSuccess: () => {
      qc.clear();
      router.replace("/login");
      router.refresh();
    },
  });
}

/* ---------------- Member data ---------------- */

export const useContests = () => useQuery({ queryKey: qk.contests, queryFn: () => services.contests.getContests() });
export const useContest = (id: string) => useQuery({ queryKey: qk.contest(id), queryFn: () => services.contests.getContestById(id) });
export const useProblems = () => useQuery({ queryKey: qk.problems, queryFn: () => services.problems.getProblems() });
export const useContestProblems = (id: string, enabled = true) =>
  useQuery({ queryKey: qk.contestProblems(id), queryFn: () => services.problems.getContestProblems(id), enabled });
export const useProblem = (id: string) => useQuery({ queryKey: qk.problem(id), queryFn: () => services.problems.getProblemById(id) });
export const useSubmissions = (filters?: SubmissionFilters) =>
  useQuery({ queryKey: qk.submissions(filters), queryFn: () => services.submissions.getSubmissions(filters) });
export const useStandings = (contestId: string, live = false) =>
  useQuery({
    queryKey: qk.standings(contestId),
    queryFn: () => services.leaderboard.getContestStandings(contestId),
    enabled: !!contestId,
    // Live boards poll in the mock; production would subscribe over WebSocket.
    refetchInterval: live ? 15_000 : false,
  });
export const useDepartmentLeaderboard = () =>
  useQuery({ queryKey: qk.department, queryFn: () => services.leaderboard.getDepartmentLeaderboard() });
export const useProfile = (userId?: string) =>
  useQuery({ queryKey: qk.profile(userId), queryFn: () => services.profiles.getProfile(userId) });
export const useNotifications = () =>
  useQuery({ queryKey: qk.notifications, queryFn: () => services.notifications.getNotifications(), refetchInterval: 30_000 });
export const useAnnouncements = (contestId?: string) =>
  useQuery({ queryKey: qk.announcements(contestId), queryFn: () => services.notifications.getAnnouncements({ contestId }) });

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => services.notifications.markRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: qk.notifications });
      qc.setQueryData(qk.notifications, (old: Awaited<ReturnType<typeof services.notifications.getNotifications>> | undefined) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.notifications }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => services.notifications.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.notifications });
      toast.success("All notifications marked as read");
    },
  });
}

/** Invalidate everything a finished verdict can affect. */
export function invalidateAfterVerdict(qc: QueryClient, contestId: string | null) {
  qc.invalidateQueries({ queryKey: ["submissions"] });
  qc.invalidateQueries({ queryKey: ["problems"] });
  qc.invalidateQueries({ queryKey: ["profile"] });
  qc.invalidateQueries({ queryKey: qk.department });
  qc.invalidateQueries({ queryKey: qk.notifications });
  qc.invalidateQueries({ queryKey: qk.admin.all });
  if (contestId) qc.invalidateQueries({ queryKey: qk.standings(contestId) });
}

export const useRunCode = () =>
  useMutation({ mutationFn: (input: Parameters<typeof services.submissions.runCode>[0]) => services.submissions.runCode(input) });

export function useCreateSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSubmissionInput) => services.submissions.createSubmission(input),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
      if (s.contestId) qc.invalidateQueries({ queryKey: qk.standings(s.contestId) });
    },
  });
}

/* ---------------- Admin ---------------- */

function useAdminMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>, success?: string | ((r: TResult) => string)) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (result) => {
      // Admin edits can affect member-facing views too.
      qc.invalidateQueries();
      if (success) toast.success(typeof success === "function" ? success(result) : success);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export const useAdminOverview = () => useQuery({ queryKey: qk.admin.overview, queryFn: () => services.admin.getOverview() });
export const useAdminContests = () => useQuery({ queryKey: qk.admin.contests, queryFn: () => services.admin.getContests() });
export const useAdminContest = (id: string) =>
  useQuery({ queryKey: qk.admin.contest(id), queryFn: () => services.admin.getContest(id), enabled: !!id });
export const useAdminProblems = () => useQuery({ queryKey: qk.admin.problems, queryFn: () => services.admin.getProblems() });
export const useAdminProblem = (id: string) =>
  useQuery({ queryKey: qk.admin.problem(id), queryFn: () => services.admin.getProblem(id), enabled: !!id });
export const useAdminUsers = () => useQuery({ queryKey: qk.admin.users, queryFn: () => services.admin.getUsers() });
export const useAdminSubmissions = (f?: SubmissionFilters) =>
  useQuery({ queryKey: qk.admin.submissions(f), queryFn: () => services.admin.getSubmissions(f) });
export const useAdminAnnouncements = () => useQuery({ queryKey: qk.admin.announcements, queryFn: () => services.admin.getAnnouncements() });
export const useAuditLogs = () => useQuery({ queryKey: qk.admin.audit, queryFn: () => services.admin.getAuditLogs() });

export const useCreateContest = () => useAdminMutation((input: ContestInput) => services.admin.createContest(input));
export const useUpdateContest = () =>
  useAdminMutation(({ id, input }: { id: string; input: ContestInput }) => services.admin.updateContest(id, input));
export const useSetContestLifecycle = () =>
  useAdminMutation(
    ({ id, lifecycle }: { id: string; lifecycle: ContestLifecycle }) => services.admin.setContestLifecycle(id, lifecycle),
    (c) => `${c.title} is now ${c.lifecycle}`,
  );
export const useCreateProblem = () => useAdminMutation((input: ProblemInput) => services.admin.createProblem(input));
export const useUpdateProblem = () =>
  useAdminMutation(({ id, input }: { id: string; input: ProblemInput }) => services.admin.updateProblem(id, input));
export const useSaveTestCases = () =>
  useAdminMutation(({ problemId, cases }: { problemId: string; cases: TestCase[] }) => services.admin.saveTestCases(problemId, cases), "Test cases saved");
export const useValidateTestCases = () =>
  useMutation({ mutationFn: (problemId: string) => services.admin.validateTestCases(problemId), onError: (e) => toast.error(errorMessage(e)) });
export const useInviteUser = () =>
  useAdminMutation((input: InviteUserInput) => services.admin.inviteUser(input), (u) => `Invitation recorded for ${u.email} (demo — no email sent)`);
export const useCreateUser = () => useAdminMutation((input: CreateUserInput) => services.admin.createUser(input), (u) => `Account created for ${u.handle}`);
export const useImportUsers = () =>
  useAdminMutation((rows: CsvImportRow[]) => services.admin.importUsers(rows), (users) => `${users.length} invitations recorded (demo — no emails sent)`);
export const useUpdateUserRole = () =>
  useAdminMutation(({ id, role }: { id: string; role: Role }) => services.admin.updateUserRole(id, role), (u) => `${u.handle} is now ${u.role.replace("_", " ")}`);
export const useSetUserStatus = () =>
  useAdminMutation(
    ({ id, status }: { id: string; status: AccountStatus }) => services.admin.setUserStatus(id, status),
    (u) => `${u.handle} ${u.status === "active" ? "reactivated" : "deactivated"}`,
  );
export const useRejudge = () =>
  useAdminMutation(({ id, outcome }: { id: string; outcome?: Verdict | "keep" }) => services.admin.rejudgeSubmission(id, outcome), (s) => `Rejudging ${s.id} (simulated)`);
export const useCreateAnnouncement = () => useAdminMutation((input: AnnouncementInput) => services.admin.createAnnouncement(input), "Announcement saved");
export const useUpdateAnnouncement = () =>
  useAdminMutation(({ id, input }: { id: string; input: AnnouncementInput }) => services.admin.updateAnnouncement(id, input), "Announcement updated");
export const useDeleteAnnouncement = () => useAdminMutation((id: string) => services.admin.deleteAnnouncement(id), "Announcement deleted");
