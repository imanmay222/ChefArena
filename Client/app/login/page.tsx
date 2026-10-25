import type { Metadata } from "next";
import { Info } from "lucide-react";
import { BrandFootnote, CodeChefCredit, LoginShowcase } from "@/components/auth/login-showcase";
import { LoginForm } from "@/components/auth/login-form";
import { RedirectIfSignedIn } from "@/components/auth/route-guards";
import { ChefArenaLogo } from "@/components/brand/chefarena-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh flex-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <RedirectIfSignedIn />
      <LoginShowcase className="hidden lg:flex" />

      <section className="relative flex min-w-0 flex-col px-4 py-4 sm:px-8 sm:py-6 lg:px-12">
        <header className="flex items-center justify-between lg:absolute lg:top-6 lg:right-8">
          <ChefArenaLogo className="lg:hidden" />
          <ThemeToggle />
        </header>

        <div className="flex flex-1 flex-col items-center justify-center py-6 sm:py-10">
          <div className="w-full max-w-[420px]">
            <div className="mb-6 space-y-3 lg:hidden">
              <CodeChefCredit />
              <p className="hidden text-3xl font-semibold tracking-tight sm:block">
                Think. Code. <span className="text-primary">Compete.</span>
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-8">
              <div className="mb-6 space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                <p className="text-sm text-muted">Sign in to continue to ChefArena.</p>
              </div>
              <LoginForm />
            </div>

            <p className="mt-5 flex items-start gap-2 px-1 text-xs leading-relaxed text-muted">
              <Info className="mt-px size-3.5 shrink-0" aria-hidden />
              <span>
                Access is invitation-only. Contact your department administrator for an
                account.
              </span>
            </p>
          </div>
        </div>

        <BrandFootnote className="pb-2 text-center lg:hidden" />
      </section>
    </main>
  );
}
