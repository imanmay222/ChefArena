"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { DemoAccounts } from "@/components/auth/demo-accounts";
import { ForgotPasswordDialog } from "@/components/auth/forgot-password-dialog";
import { Button, focusRing } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { signIn, validateCredentials } from "@/lib/auth/mock-auth";
import { homeRouteFor } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import type { CredentialErrors, DemoAccount } from "@/types/auth";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // UI-only for Phase 1: the mock session always ends with the browser tab.
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<CredentialErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  // Move focus to the cleared password once the fieldset is re-enabled.
  useEffect(() => {
    if (formError && !isPending) passwordRef.current?.focus();
  }, [formError, isPending]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const credentials = { identifier, password };
    const errors = validateCredentials(credentials);
    setFieldErrors(errors);
    setFormError(null);
    if (errors.identifier || errors.password) {
      (errors.identifier ? identifierRef : passwordRef).current?.focus();
      return;
    }

    // The transition stays pending through the redirect, so the button keeps
    // its loading state until the destination page has rendered.
    startTransition(async () => {
      const result = await signIn(credentials);
      if (!result.ok) {
        setFormError(result.error);
        setPassword("");
        return;
      }
      startTransition(() => {
        // This page stays mounted in the background, so drop the password.
        setPassword("");
        setShowPassword(false);
        router.replace(homeRouteFor(result.user.role));
      });
    });
  }

  function fillDemoAccount(account: DemoAccount) {
    setIdentifier(account.email);
    setPassword(account.password);
    setFieldErrors({});
    setFormError(null);
    submitRef.current?.focus();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} noValidate aria-describedby={formError ? "form-error" : undefined}>
        <fieldset disabled={isPending} className="space-y-4">
          <legend className="sr-only">Sign in credentials</legend>

          {formError && (
            <div
              id="form-error"
              role="alert"
              className="flex gap-2.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>{formError}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="identifier">Email or username</Label>
            <Input
              ref={identifierRef}
              id="identifier"
              name="identifier"
              type="text"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@chefarena.demo"
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value);
                setFieldErrors((errors) => ({ ...errors, identifier: undefined }));
              }}
              aria-invalid={fieldErrors.identifier ? true : undefined}
              aria-describedby={fieldErrors.identifier ? "identifier-error" : undefined}
            />
            <FieldError id="identifier-error">{fieldErrors.identifier}</FieldError>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <ForgotPasswordDialog />
            </div>
            <div className="relative">
              <Input
                ref={passwordRef}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setFieldErrors((errors) => ({ ...errors, password: undefined }));
                }}
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-controls="password"
                className={cn(
                  "absolute inset-y-1 right-1 grid w-9 cursor-pointer place-items-center rounded-md text-muted transition-colors hover:text-foreground",
                  focusRing,
                  "focus-visible:ring-offset-0",
                )}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
            <FieldError id="password-error">{fieldErrors.password}</FieldError>
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-2.5 py-0.5 text-sm text-muted select-none">
            <input
              type="checkbox"
              name="remember"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className={cn("size-4 cursor-pointer rounded accent-primary", focusRing)}
            />
            Remember me
          </label>

          <Button ref={submitRef} type="submit" size="lg" className="w-full" aria-busy={isPending}>
            {isPending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </fieldset>
      </form>

      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
          Phase 1 demo
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <DemoAccounts onSelect={fillDemoAccount} disabled={isPending} />
    </div>
  );
}
