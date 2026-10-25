"use client";

import { useRef } from "react";
import { KeyRound, X } from "lucide-react";
import { Button, focusRing } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ForgotPasswordDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={cn(
          "cursor-pointer rounded text-xs font-medium text-primary hover:underline underline-offset-4",
          focusRing,
        )}
      >
        Forgot password?
      </button>

      {/* Native modal dialog: traps focus, closes on Escape, restores focus on close. */}
      <dialog
        ref={dialogRef}
        aria-labelledby="forgot-password-title"
        aria-describedby="forgot-password-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-border bg-surface p-0 text-foreground shadow-card backdrop:bg-black/60 backdrop:backdrop-blur-[2px]"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-10 place-items-center rounded-xl border border-border bg-elevated text-primary">
              <KeyRound className="size-5" aria-hidden />
            </span>
            <Button variant="ghost" size="sm" onClick={close} aria-label="Close" className="-mr-2 -mt-1 size-8 px-0">
              <X className="size-4" aria-hidden />
            </Button>
          </div>
          <h2 id="forgot-password-title" className="mt-4 text-base font-semibold">
            Reset your password
          </h2>
          <p id="forgot-password-description" className="mt-1.5 text-sm leading-relaxed text-muted">
            ChefArena accounts are managed by the department. Contact your department
            administrator to reset your password.
          </p>
          <Button onClick={close} className="mt-6 w-full" autoFocus>
            Got it
          </Button>
        </div>
      </dialog>
    </>
  );
}
