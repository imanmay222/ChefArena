"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { services } from "@/lib/services";

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  defaultIdentifier,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultIdentifier: string;
}) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string>();

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) {
          setValue(defaultIdentifier);
          setState("idle");
          setError(undefined);
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>Password resets are handled by your department&apos;s CP leads.</DialogDescription>
        </DialogHeader>
        {state === "done" ? (
          <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/8 p-3 text-[13px]">
            <CheckCircle2 className="mt-px size-4 shrink-0 text-success" />
            <p>
              Request recorded. <span className="text-muted-foreground">This is a demo — no email was sent. In production the Go backend will email a reset link if the account exists.</span>
            </p>
          </div>
        ) : (
          <form
            id="forgot-form"
            className="grid gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!value.trim()) return setError("Enter your email or handle");
              setError(undefined);
              setState("sending");
              await services.auth.requestPasswordReset(value.trim());
              setState("done");
            }}
          >
            <Field id="forgot-identifier" label="Email or handle" error={error}>
              <Input value={value} onChange={(e) => setValue(e.target.value)} autoComplete="username" />
            </Field>
          </form>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {state === "done" ? "Close" : "Cancel"}
          </Button>
          {state !== "done" && (
            <Button type="submit" form="forgot-form" disabled={state === "sending"}>
              {state === "sending" && <Loader2 className="animate-spin" />} Request reset
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
