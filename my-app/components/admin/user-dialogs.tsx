"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, FileUp, Loader2 } from "lucide-react";
import type { CsvImportRow, Role } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCreateUser, useImportUsers, useInviteUser } from "@/lib/queries";
import { createUserSchema, inviteSchema, parseCsv, type CreateUserValues, type InviteValues } from "@/lib/validation/user";
import { ROLE_LABEL } from "@/lib/auth/permissions";

function RoleSelect({ value, onChange, allowStaff, id }: { value: Role; onChange: (r: Role) => void; allowStaff: boolean; id: string }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Role)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(["member", "cp_lead", "super_admin"] as Role[]).map((r) => (
          <SelectItem key={r} value={r} disabled={r !== "member" && !allowStaff}>
            {ROLE_LABEL[r]}
            {r !== "member" && !allowStaff ? " (Super Admin only)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function InviteDialog({ open, onOpenChange, allowStaff }: { open: boolean; onOpenChange: (o: boolean) => void; allowStaff: boolean }) {
  const invite = useInviteUser();
  const form = useForm<InviteValues>({ resolver: zodResolver(inviteSchema), defaultValues: { name: "", email: "", role: "member" } });
  const { register, handleSubmit, control, formState, reset } = form;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>ChefArena is invitation-only. The invitee sets a password from the link they receive.</DialogDescription>
        </DialogHeader>
        <form
          id="invite-form"
          className="grid gap-4"
          noValidate
          onSubmit={handleSubmit((v) =>
            invite.mutate(v, {
              onSuccess: () => {
                onOpenChange(false);
                reset();
              },
            }),
          )}
        >
          <Field id="invite-name" label="Full name" required error={formState.errors.name?.message}>
            <Input {...register("name")} />
          </Field>
          <Field id="invite-email" label="Email" required error={formState.errors.email?.message}>
            <Input type="email" placeholder="name@chefarena.demo" {...register("email")} />
          </Field>
          <Controller control={control} name="role" render={({ field }) => (
            <div className="grid gap-1.5">
              <label htmlFor="invite-role" className="text-[13px] font-medium">Role</label>
              <RoleSelect id="invite-role" value={field.value} onChange={field.onChange} allowStaff={allowStaff} />
            </div>
          )} />
          <p className="rounded-lg border border-dashed border-warning/40 px-3 py-2 text-xs text-muted-foreground">
            Demo mode: the invitation is recorded with status <span className="font-medium text-foreground">pending</span>, but no email is sent.
          </p>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="invite-form" disabled={invite.isPending}>
            {invite.isPending && <Loader2 className="animate-spin" />} Record invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateUserDialog({ open, onOpenChange, allowStaff }: { open: boolean; onOpenChange: (o: boolean) => void; allowStaff: boolean }) {
  const create = useCreateUser();
  const form = useForm<CreateUserValues>({ resolver: zodResolver(createUserSchema), defaultValues: { name: "", email: "", handle: "", batch: "2025", role: "member" } });
  const { register, handleSubmit, control, formState, reset } = form;
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create account</DialogTitle>
          <DialogDescription>Creates an active account directly, for members who can&apos;t use an invitation link.</DialogDescription>
        </DialogHeader>
        <form
          id="create-user-form"
          className="grid gap-4"
          noValidate
          onSubmit={handleSubmit((v) =>
            create.mutate(v, {
              onSuccess: () => {
                onOpenChange(false);
                reset();
              },
            }),
          )}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="cu-name" label="Full name" required error={formState.errors.name?.message}>
              <Input {...register("name")} />
            </Field>
            <Field id="cu-handle" label="Handle" required error={formState.errors.handle?.message}>
              <Input className="font-mono" placeholder="new_member" {...register("handle")} />
            </Field>
          </div>
          <Field id="cu-email" label="Email" required error={formState.errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="cu-batch" label="Batch" required error={formState.errors.batch?.message}>
              <Input inputMode="numeric" {...register("batch")} />
            </Field>
            <Controller control={control} name="role" render={({ field }) => (
              <div className="grid gap-1.5">
                <label htmlFor="cu-role" className="text-[13px] font-medium">Role</label>
                <RoleSelect id="cu-role" value={field.value} onChange={field.onChange} allowStaff={allowStaff} />
              </div>
            )} />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="create-user-form" disabled={create.isPending}>
            {create.isPending && <Loader2 className="animate-spin" />} Create account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const SAMPLE_CSV = `name,email,handle,batch
Kavya Reddy,kavya.r@chefarena.demo,kavya_r,2025
Nikhil Joshi,nikhil.j@chefarena.demo,nikhil.j,2025
Bad Row,not-an-email,X,25`;

export function CsvImportDialog({ open, onOpenChange, existingEmails }: { open: boolean; onOpenChange: (o: boolean) => void; existingEmails: Set<string> }) {
  const importUsers = useImportUsers();
  const [text, setText] = useState("");
  const [rows, setRows] = useState<CsvImportRow[] | null>(null);
  const valid = rows?.filter((r) => !r.errors.length) ?? [];

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      setText("");
      setRows(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import members from CSV</DialogTitle>
          <DialogDescription>
            Columns: <code className="font-mono text-xs">name,email,handle,batch</code>. Valid rows become pending invitations.
          </DialogDescription>
        </DialogHeader>
        {!rows ? (
          <div className="grid gap-3">
            <Textarea rows={7} className="font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} placeholder={SAMPLE_CSV} aria-label="CSV content" />
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-accent">
                <FileUp className="size-4" /> Choose .csv file
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) setText(await f.text());
                  }}
                />
              </label>
              <Button variant="ghost" size="sm" onClick={() => setText(SAMPLE_CSV)}>
                Use sample data
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            <p className="flex items-center gap-2 text-[13px]">
              <CheckCircle2 className="size-4 text-success" /> {valid.length} ready
              {rows.length - valid.length > 0 && (
                <>
                  <AlertTriangle className="ml-2 size-4 text-warning" /> {rows.length - valid.length} will be skipped
                </>
              )}
            </p>
            <div className="max-h-72 overflow-auto rounded-lg border border-border scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Line</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Handle</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.line}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{r.line}</TableCell>
                      <TableCell>{r.name || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{r.email || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{r.handle || "—"}</TableCell>
                      <TableCell>{r.errors.length ? <span className="text-xs text-destructive">{r.errors.join(", ")}</span> : <span className="text-xs text-success">OK</span>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">Demo mode: invitations are recorded without sending emails.</p>
          </div>
        )}
        <DialogFooter>
          {rows ? (
            <>
              <Button variant="outline" onClick={() => setRows(null)}>
                Back
              </Button>
              <Button disabled={!valid.length || importUsers.isPending} onClick={() => importUsers.mutate(valid, { onSuccess: () => close(false) })}>
                {importUsers.isPending && <Loader2 className="animate-spin" />} Import {valid.length} member{valid.length === 1 ? "" : "s"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button disabled={!text.trim()} onClick={() => setRows(parseCsv(text, existingEmails))}>
                Preview import
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
