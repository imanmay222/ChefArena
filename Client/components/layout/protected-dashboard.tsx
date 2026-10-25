"use client";

import { Construction, LogOut } from "lucide-react";
import { RoleBadge } from "@/components/auth/role-badge";
import { RequireRole } from "@/components/auth/route-guards";
import { ChefArenaLogo } from "@/components/brand/chefarena-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/mock-auth";
import type { Role } from "@/types/auth";

interface ProtectedDashboardProps {
  role: Role;
  heading: string;
  description: string;
}

/**
 * Phase 1 placeholder workspace for one role. Signing out clears the mock
 * session, and RequireRole then sends the visitor back to /login.
 */
export function ProtectedDashboard({ role, heading, description }: ProtectedDashboardProps) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="border-b border-border bg-sidebar/80">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <ChefArenaLogo />
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button variant="secondary" onClick={signOut}>
              <LogOut className="size-4" aria-hidden />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <RequireRole role={role}>
          {({ user }) => (
            <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
              <RoleBadge role={user.role} />
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {heading}
              </h1>
              <p className="mt-3 text-muted">
                Signed in as <span className="font-medium text-foreground">{user.displayName}</span>
                <span className="mx-2 text-border-strong" aria-hidden>·</span>
                <span className="font-mono text-sm">{user.email}</span>
              </p>

              <section className="mt-10 max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-card">
                <div className="flex items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-elevated text-primary">
                    <Construction className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="font-medium">Coming in a future phase</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
                  </div>
                </div>
              </section>

              <p className="mt-6 font-mono text-[11px] text-muted">
                Mock frontend session · stored in this browser tab only · not secure authentication
              </p>
            </div>
          )}
        </RequireRole>
      </main>
    </div>
  );
}
