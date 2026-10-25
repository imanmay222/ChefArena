"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Megaphone, MoreHorizontal, Pencil, Pin, Plus, Trash2 } from "lucide-react";
import type { Announcement } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useAdminAnnouncements, useAdminContests, useAdminUsers, useCreateAnnouncement, useDeleteAnnouncement, useUpdateAnnouncement } from "@/lib/queries";
import { announcementSchema, type AnnouncementValues } from "@/lib/validation/announcement";
import { useNow } from "@/hooks/use-now";
import { fmtRelative } from "@/lib/utils/format";

function AnnouncementDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (o: boolean) => void; editing: Announcement | null }) {
  const contests = useAdminContests();
  const create = useCreateAnnouncement();
  const update = useUpdateAnnouncement();
  const form = useForm<AnnouncementValues>({
    resolver: zodResolver(announcementSchema),
    values: editing
      ? { title: editing.title, body: editing.body, contestId: editing.contestId, pinned: editing.pinned, published: editing.published }
      : { title: "", body: "", contestId: null, pinned: false, published: true },
  });
  const { register, control, handleSubmit, formState } = form;
  const v = useWatch({ control });
  const busy = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit announcement" : "New announcement"}</DialogTitle>
          <DialogDescription>Published announcements appear on dashboards and contest pages, and notify members in-app.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 md:grid-cols-2">
          <form
            id="announcement-form"
            className="grid content-start gap-4"
            noValidate
            onSubmit={handleSubmit((values) => {
              const done = { onSuccess: () => onOpenChange(false) };
              if (editing) update.mutate({ id: editing.id, input: values }, done);
              else create.mutate(values, done);
            })}
          >
            <Field id="a-title" label="Title" required error={formState.errors.title?.message}>
              <Input {...register("title")} />
            </Field>
            <Field id="a-body" label="Message" required error={formState.errors.body?.message}>
              <Textarea rows={5} {...register("body")} />
            </Field>
            <Controller
              control={control}
              name="contestId"
              render={({ field }) => (
                <div className="grid gap-1.5">
                  <Label htmlFor="a-contest">Scope</Label>
                  <Select value={field.value ?? "global"} onValueChange={(x) => field.onChange(x === "global" ? null : x)}>
                    <SelectTrigger id="a-contest" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Whole department</SelectItem>
                      {contests.data?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
            <div className="grid gap-3 rounded-lg border border-border p-3">
              <Controller control={control} name="pinned" render={({ field }) => (
                <div className="flex items-center justify-between">
                  <Label htmlFor="a-pinned" className="font-normal">Pin to the top</Label>
                  <Switch id="a-pinned" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )} />
              <Controller control={control} name="published" render={({ field }) => (
                <div className="flex items-center justify-between">
                  <Label htmlFor="a-published" className="font-normal">Published</Label>
                  <Switch id="a-published" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )} />
            </div>
          </form>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-1.5">
                {v.pinned && <Pin className="size-3 text-primary" />}
                <p className="text-[13px] font-medium">{v.title || "Announcement title"}</p>
              </div>
              <p className="mt-1 text-[13px] whitespace-pre-line text-muted-foreground">{v.body || "Your message appears here."}</p>
              <p className="mt-2 text-[11px] text-muted-foreground/80">
                {v.contestId ? contests.data?.find((c) => c.id === v.contestId)?.shortTitle : "Department"} · just now
              </p>
            </div>
            {!v.published && <p className="mt-2 text-xs text-warning">Saved as a draft — members won&apos;t see it.</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="announcement-form" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} {editing ? "Save changes" : v.published ? "Publish" : "Save draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminAnnouncements({ openNew = false }: { openNew?: boolean }) {
  const now = useNow(60_000);
  const { data, isPending, isError, error, refetch } = useAdminAnnouncements();
  const users = useAdminUsers();
  const contests = useAdminContests();
  const del = useDeleteAnnouncement();
  const update = useUpdateAnnouncement();
  const [dialog, setDialog] = useState<{ open: boolean; editing: Announcement | null }>({ open: openNew, editing: null });
  const [deleting, setDeleting] = useState<Announcement | null>(null);

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Clarifications and department news."
        actions={
          <Button onClick={() => setDialog({ open: true, editing: null })}>
            <Plus /> New announcement
          </Button>
        }
      />
      <Card className="overflow-hidden">
        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : isPending ? (
          <TableSkeleton rows={4} />
        ) : data.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements yet" />
        ) : (
          <ul className="divide-y divide-border">
            {data.map((a) => {
              const author = users.data?.find((u) => u.id === a.authorId);
              const contest = contests.data?.find((c) => c.id === a.contestId);
              return (
                <li key={a.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {a.pinned && <Pin className="size-3.5 text-primary" aria-label="Pinned" />}
                      <p className="text-[13px] font-medium">{a.title}</p>
                      {a.published ? <Badge variant="success">Published</Badge> : <Badge variant="neutral">Draft</Badge>}
                      <Badge variant="outline">{contest ? contest.shortTitle : "Department"}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">{a.body}</p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {author?.handle ?? a.authorId} · {now ? fmtRelative(a.createdAt, now) : ""}
                      {a.updatedAt !== a.createdAt && now ? ` · edited ${fmtRelative(a.updatedAt, now)}` : ""}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${a.title}`}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setDialog({ open: true, editing: a })}>
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => update.mutate({ id: a.id, input: { title: a.title, body: a.body, contestId: a.contestId, pinned: !a.pinned, published: a.published } })}>
                        <Pin /> {a.pinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem destructive onSelect={() => setDeleting(a)}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <AnnouncementDialog open={dialog.open} editing={dialog.editing} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} />
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleting?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>It disappears from dashboards and contest pages. Notifications already delivered stay in members&apos; inboxes.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction destructive onClick={() => deleting && del.mutate(deleting.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
