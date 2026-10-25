"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import { Check, DatabaseZap, Lock, Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import type { Language } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePreferences, type Preferences } from "@/hooks/use-preferences";
import { useHydrated } from "@/hooks/use-media-query";
import { useCurrentUser } from "@/lib/queries";
import { resetMockDb } from "@/lib/services/mock";
import { LANGUAGES, LANGUAGE_ORDER } from "@/lib/editor/languages";
import { cn } from "@/lib/utils/cn";

function Row({ id, label, description, children }: { id: string; label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <Label htmlFor={id}>{label}</Label>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ToggleRow({ k, label, description }: { k: keyof Preferences; label: string; description?: string }) {
  const [prefs, setPrefs] = usePreferences();
  return (
    <Row id={k} label={label} description={description}>
      <Switch id={k} checked={prefs[k] as boolean} onCheckedChange={(v) => setPrefs({ [k]: v })} />
    </Row>
  );
}

const THEMES = [
  { id: "light", label: "Light", icon: Sun, preview: "bg-[#f5f7fb]", bar: "bg-white", line: "bg-slate-300" },
  { id: "dark", label: "Dark", icon: Moon, preview: "bg-[#0b0d12]", bar: "bg-[#151b27]", line: "bg-slate-700" },
  { id: "system", label: "System", icon: Monitor, preview: "bg-gradient-to-r from-[#f5f7fb] from-50% to-[#0b0d12] to-50%", bar: "bg-white/70", line: "bg-slate-400" },
] as const;

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const [prefs, setPrefs] = usePreferences();
  const { data: user } = useCurrentUser();
  const qc = useQueryClient();
  const [resetting, setResetting] = useState(false);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-col">
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how ChefArena looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-3 sm:max-w-lg">
            {THEMES.map((t) => {
              const active = hydrated && theme === t.id;
              return (
                <button
                  key={t.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    active ? "border-primary ring-1 ring-primary" : "border-border hover:border-border-strong",
                  )}
                >
                  <div className={cn("flex h-16 flex-col gap-1.5 rounded-md p-2", t.preview)} aria-hidden>
                    <div className={cn("h-2.5 w-3/4 rounded", t.bar)} />
                    <div className={cn("h-1.5 w-1/2 rounded", t.line)} />
                    <div className={cn("h-1.5 w-2/3 rounded", t.line)} />
                  </div>
                  <div className="mt-2 flex items-center justify-between px-0.5">
                    <span className="flex items-center gap-1.5 text-[13px] font-medium">
                      <t.icon className="size-3.5" /> {t.label}
                    </span>
                    {active && <Check className="size-3.5 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-5 divide-y divide-border">
            <ToggleRow k="compactTables" label="Compact tables" description="Tighter row spacing in standings and lists." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col">
          <CardTitle>Editor</CardTitle>
          <CardDescription>Applied to the coding arena. Drafts are kept per problem and language on this device.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <Row id="defaultLanguage" label="Preferred language" description="Used when you open a problem for the first time.">
            <Select value={prefs.defaultLanguage} onValueChange={(v) => setPrefs({ defaultLanguage: v as Language })}>
              <SelectTrigger id="defaultLanguage" size="sm" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_ORDER.map((l) => (
                  <SelectItem key={l} value={l}>
                    {LANGUAGES[l].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <Row id="editorFontSize" label="Font size">
            <Select value={String(prefs.editorFontSize)} onValueChange={(v) => setPrefs({ editorFontSize: Number(v) })}>
              <SelectTrigger id="editorFontSize" size="sm" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[12, 13, 14, 15, 16, 18, 20].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>
          <ToggleRow k="wordWrap" label="Word wrap" description="Wrap long lines instead of scrolling horizontally." />
          <ToggleRow k="minimap" label="Minimap" description="Show the code overview on wide screens." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col">
          <CardTitle>Notifications</CardTitle>
          <CardDescription>In-app notifications. Email delivery will be configured by the backend.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <ToggleRow k="notifyContestReminders" label="Contest reminders" description="An hour before each round you're registered for." />
          <ToggleRow k="notifySubmissionResults" label="Submission results" description="When a verdict is ready." />
          <ToggleRow k="notifyAnnouncements" label="Announcements" description="Clarifications and department news from CP leads." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col">
          <CardTitle>Profile display</CardTitle>
          <CardDescription>Controls how your profile appears. Saved on this device until the profile API is available.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <ToggleRow k="showRealName" label="Show my full name" description="Otherwise only your handle is shown." />
          <ToggleRow k="showRatingPublicly" label="Show rating on my profile" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col">
          <CardTitle>Account</CardTitle>
          <CardDescription>Account details are managed by your CP leads.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:max-w-md">
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} readOnly disabled />
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-2/60 p-3 text-xs text-muted-foreground">
            <Lock className="mt-px size-3.5 shrink-0" />
            Password changes will be handled by the Go backend with secure session handling. They are not available in this demo.
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed border-warning/40">
        <CardHeader className="flex-col">
          <CardTitle className="flex items-center gap-2">
            <DatabaseZap className="size-4 text-warning" /> Demo data
          </CardTitle>
          <CardDescription>
            Simulated submissions and admin edits are stored in this browser. Reset to restore the original mock dataset with fresh contest times.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={resetting}>
                Reset demo data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
                <AlertDialogDescription>
                  Submissions, contests, problems, users and announcements return to their original state. Your theme and editor preferences are kept.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  destructive
                  onClick={async () => {
                    setResetting(true);
                    resetMockDb();
                    await qc.invalidateQueries();
                    setResetting(false);
                    toast.success("Demo data reset");
                  }}
                >
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
