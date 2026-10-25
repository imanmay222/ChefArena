"use client";

import { useState } from "react";
import { FileSpreadsheet, MoreHorizontal, Search, UserCheck, UserPlus, UserRoundPlus, UserX, X } from "lucide-react";
import type { AccountStatus, AdminUser, InvitationStatus, Role } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/status-badges";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/feedback/states";
import { CreateUserDialog, CsvImportDialog, InviteDialog } from "./user-dialogs";
import { useAdminUsers, useCurrentUser, useSetUserStatus, useUpdateUserRole } from "@/lib/queries";
import { useNow } from "@/hooks/use-now";
import { ROLE_LABEL, canManageUsers } from "@/lib/auth/permissions";
import { fmtDate, fmtRelative } from "@/lib/utils/format";

const INVITATION_BADGE: Record<InvitationStatus, { label: string; variant: "success" | "warning" | "neutral" }> = {
  accepted: { label: "Accepted", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  expired: { label: "Expired", variant: "neutral" },
};

export function UsersTable({ mode, openInvite = false }: { mode: "participants" | "users"; openInvite?: boolean }) {
  const now = useNow(60_000);
  const { data: me } = useCurrentUser();
  const { data, isPending, isError, error, refetch } = useAdminUsers();
  const setStatus = useSetUserStatus();
  const setRole = useUpdateUserRole();
  const isSuper = canManageUsers(me?.role);

  const [query, setQuery] = useState("");
  const [role, setRoleFilter] = useState<Role | "all">(mode === "participants" ? "member" : "all");
  const [status, setStatusFilter] = useState<AccountStatus | "all">("all");
  const [invitation, setInvitation] = useState<InvitationStatus | "all">("all");
  const [inviteOpen, setInviteOpen] = useState(openInvite);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [confirm, setConfirm] = useState<AdminUser | null>(null);

  const q = query.trim().toLowerCase();
  const rows = (data ?? [])
    .filter((u) => !q || u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    .filter((u) => role === "all" || u.role === role)
    .filter((u) => status === "all" || u.status === status)
    .filter((u) => invitation === "all" || u.invitation === invitation);
  const filtersActive = q !== "" || status !== "all" || invitation !== "all" || role !== (mode === "participants" ? "member" : "all");
  const canChangeStatus = (u: AdminUser) => u.id !== me?.id && (u.role === "member" || isSuper);

  return (
    <>
      <PageHeader
        title={mode === "participants" ? "Participants" : "User management"}
        description={
          mode === "participants"
            ? "Department roster, invitations and account status."
            : "Roles and access for every account. Only Super Admins can change roles."
        }
        actions={
          <>
            {mode === "participants" && (
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <FileSpreadsheet /> Import CSV
              </Button>
            )}
            <Button variant="outline" onClick={() => setCreateOpen(true)}>
              <UserRoundPlus /> Create account
            </Button>
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus /> Invite
            </Button>
          </>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, handle or email" className="h-8 pl-8 text-[13px]" aria-label="Search users" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={role} onValueChange={(v) => setRoleFilter(v as Role | "all")}>
              <SelectTrigger size="sm" aria-label="Role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatusFilter(v as AccountStatus | "all")}>
              <SelectTrigger size="sm" aria-label="Account status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={invitation} onValueChange={(v) => setInvitation(v as InvitationStatus | "all")}>
              <SelectTrigger size="sm" aria-label="Invitation status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any invitation</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            {filtersActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setRoleFilter(mode === "participants" ? "member" : "all");
                  setStatusFilter("all");
                  setInvitation("all");
                }}
              >
                <X /> Clear
              </Button>
            )}
          </div>
        </div>
        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : isPending ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState title="No accounts match" />
        ) : (
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Account</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Invitation</TableHead>
                <TableHead>Status</TableHead>
                {mode === "participants" ? (
                  <>
                    <TableHead className="text-right">Contests</TableHead>
                    <TableHead className="text-right">Solved</TableHead>
                  </>
                ) : (
                  <TableHead>Last active</TableHead>
                )}
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id} className={u.status === "deactivated" ? "opacity-60" : undefined}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={u.name} seed={u.id} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium">
                          {u.name}
                          {u.id === me?.id && <span className="ml-1.5 text-[11px] font-normal text-primary">(you)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-mono">@{u.handle}</span> · {u.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {mode === "users" && isSuper && u.id !== me?.id ? (
                      <Select value={u.role} onValueChange={(r) => setRole.mutate({ id: u.id, role: r as Role })}>
                        <SelectTrigger size="sm" className="h-7 w-36 text-xs" aria-label={`Role for ${u.handle}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                            <SelectItem key={r} value={r}>
                              {ROLE_LABEL[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <RoleBadge role={u.role} />
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.batch}</TableCell>
                  <TableCell>
                    <Badge variant={INVITATION_BADGE[u.invitation].variant}>{INVITATION_BADGE[u.invitation].label}</Badge>
                  </TableCell>
                  <TableCell>{u.status === "active" ? <Badge variant="success">Active</Badge> : <Badge variant="destructive">Deactivated</Badge>}</TableCell>
                  {mode === "participants" ? (
                    <>
                      <TableCell className="text-right font-mono tabular">{u.contestsAttended}</TableCell>
                      <TableCell className="text-right font-mono tabular">{u.problemsSolved}</TableCell>
                    </>
                  ) : (
                    <TableCell className="text-muted-foreground" title={u.lastActiveAt ? fmtDate(u.lastActiveAt) : undefined}>
                      {u.lastActiveAt && now ? fmtRelative(u.lastActiveAt, now) : "Never"}
                    </TableCell>
                  )}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${u.handle}`} disabled={!canChangeStatus(u)}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {u.status === "active" ? (
                          <DropdownMenuItem destructive onSelect={() => setConfirm(u)}>
                            <UserX /> Deactivate account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onSelect={() => setStatus.mutate({ id: u.id, status: "active" })}>
                            <UserCheck /> Reactivate account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {confirm?.handle}?</AlertDialogTitle>
            <AlertDialogDescription>
              They will be signed out and unable to log in or submit. Their past submissions and standings are kept. You can reactivate the account later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction destructive onClick={() => confirm && setStatus.mutate({ id: confirm.id, status: "deactivated" })}>
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} allowStaff={isSuper} />
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} allowStaff={isSuper} />
      <CsvImportDialog open={importOpen} onOpenChange={setImportOpen} existingEmails={new Set((data ?? []).map((u) => u.email.toLowerCase()))} />
    </>
  );
}
