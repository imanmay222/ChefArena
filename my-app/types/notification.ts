export type NotificationType = "contest_reminder" | "submission_result" | "announcement" | "contest_result" | "editorial";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  createdAt: string;
  read: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  contestId: string | null;
  authorId: string;
  pinned: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementInput = Pick<Announcement, "title" | "body" | "contestId" | "pinned" | "published">;

export type AuditAction =
  | "contest.create"
  | "contest.update"
  | "contest.publish"
  | "contest.archive"
  | "problem.create"
  | "problem.update"
  | "testcase.update"
  | "user.invite"
  | "user.create"
  | "user.role_change"
  | "user.deactivate"
  | "user.reactivate"
  | "submission.rejudge"
  | "announcement.publish"
  | "announcement.update"
  | "announcement.delete";

export interface AuditEvent {
  id: string;
  actorId: string;
  action: AuditAction;
  targetType: "contest" | "problem" | "user" | "submission" | "announcement" | "testcase";
  targetId: string;
  targetLabel: string;
  createdAt: string;
  detail?: string;
}
