import type { Role, User } from "./user";
import type { AuditEvent } from "./notification";
import type { Contest } from "./contest";

export interface AdminOverview {
  totalParticipants: number;
  activeParticipants: number;
  pendingInvitations: number;
  activeContests: number;
  upcomingContests: Contest[];
  totalProblems: number;
  totalSubmissions: number;
  submissionsToday: number;
  acceptanceRate: number;
  recentActivity: AuditEvent[];
}

export interface InviteUserInput {
  email: string;
  name: string;
  role: Role;
}

export interface CreateUserInput {
  email: string;
  name: string;
  handle: string;
  role: Role;
  batch: string;
}

export interface CsvImportRow {
  line: number;
  name: string;
  email: string;
  handle: string;
  batch: string;
  errors: string[];
}

export type AdminUser = User & { contestsAttended: number; problemsSolved: number };
