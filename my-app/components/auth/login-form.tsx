"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Eye, EyeOff, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/lib/queries";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";
import { errorMessage } from "@/lib/services/errors";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/mock-data/users";
import { canAccessAdmin } from "@/lib/auth/permissions";
import { ForgotPasswordDialog } from "./forgot-password-dialog";

const DEMO_ROWS = [
  { label: "Member", email: DEMO_ACCOUNTS.member.email },
  { label: "CP Lead", email: DEMO_ACCOUNTS.lead.email },
  { label: "Super Admin", email: DEMO_ACCOUNTS.admin.email },
];

/** Only allow same-origin relative redirects. */
function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/login")) return null;
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", remember: true },
  });
  const { register, handleSubmit, formState, setValue, control } = form;
  const remember = useWatch({ control, name: "remember" });
  const identifier = useWatch({ control, name: "identifier" });

  const onSubmit = handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: (user) => {
        const next = safeNext(new URLSearchParams(window.location.search).get("next"));
        const fallback = canAccessAdmin(user.role) ? "/admin" : "/dashboard";
        router.replace(next && (!next.startsWith("/admin") || canAccessAdmin(user.role)) ? next : fallback);
        router.refresh();
      },
    }),
  );

  const busy = login.isPending || login.isSuccess;

  return (
    <div className="w-full max-w-[380px]">
      <div className="mb-7">
        <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Welcome back. Use the account your CP lead created for you.</p>
      </div>

      <AnimatePresence initial={false}>
        {login.isError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-[13px] text-destructive">
              <AlertCircle className="mt-px size-4 shrink-0" />
              <span>{errorMessage(login.error)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <Field id="identifier" label="Email or handle" error={formState.errors.identifier?.message} wrapped>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="identifier"
              autoComplete="username"
              autoFocus
              placeholder="you@chefarena.demo"
              className="h-10 pl-9"
              aria-invalid={formState.errors.identifier ? true : undefined}
              aria-describedby={formState.errors.identifier ? "identifier-error" : undefined}
              {...register("identifier")}
            />
          </div>
        </Field>

        <Field
          id="password"
          label="Password"
          error={formState.errors.password?.message}
          wrapped
          labelAction={
            <button type="button" onClick={() => setForgotOpen(true)} className="cursor-pointer text-xs font-medium text-primary hover:underline">
              Forgot password?
            </button>
          }
        >
          <div className="relative">
            <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-10 pr-10 pl-9"
              aria-invalid={formState.errors.password ? true : undefined}
              aria-describedby={formState.errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setValue("remember", v === true)} />
          <Label htmlFor="remember" className="font-normal text-muted-foreground">
            Keep me signed in for 30 days
          </Label>
        </div>

        <Button type="submit" size="lg" className="mt-1 h-10 w-full" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 text-xs text-muted-foreground">
        <ShieldCheck className="mt-px size-4 shrink-0 text-primary" />
        <p>
          ChefArena is <span className="font-medium text-foreground">invitation-only</span>. There is no public sign-up — ask your department CP lead for an
          invitation.
        </p>
      </div>

      <details className="group mt-4 rounded-lg border border-dashed border-warning/40 px-3 py-2.5 text-xs">
        <summary className="cursor-pointer list-none font-medium text-warning marker:hidden">
          <span className="inline-flex items-center gap-1.5">Demo accounts · local development only</span>
        </summary>
        <p className="mt-2 text-muted-foreground">
          Password for all three: <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">{DEMO_PASSWORD}</code>. Sessions are simulated in the
          browser and are not secure.
        </p>
        <div className="mt-2 grid gap-1">
          {DEMO_ROWS.map((row) => (
            <button
              key={row.email}
              type="button"
              className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-accent"
              onClick={() => {
                setValue("identifier", row.email, { shouldValidate: true });
                setValue("password", DEMO_PASSWORD, { shouldValidate: true });
              }}
            >
              <span className="font-medium text-foreground">{row.label}</span>
              <span className="font-mono text-muted-foreground">{row.email}</span>
            </button>
          ))}
        </div>
      </details>

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} defaultIdentifier={identifier} />
    </div>
  );
}
