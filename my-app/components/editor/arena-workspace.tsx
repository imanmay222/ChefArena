"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";
import {
  AlignJustify,
  CloudCheck,
  FileText,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  PanelBottomClose,
  PanelBottomOpen,
  Play,
  Plus,
  RotateCcw,
  Send,
  SquareTerminal,
  WrapText,
} from "lucide-react";
import { toast } from "sonner";
import type { Language, Problem, RunResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hint } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
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
import { ProblemStatement } from "@/components/problems/problem-statement";
import { EditorSkeleton } from "./code-editor";
import { ResultsPanel, type ResultsTab, type SimulatedOutcome } from "./results-panel";
import { useCodeDraft } from "@/hooks/use-code-draft";
import { usePreferences } from "@/hooks/use-preferences";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSubmissionTracker } from "@/hooks/use-submission-tracker";
import { useCreateSubmission, useRunCode } from "@/lib/queries";
import { LANGUAGES, LANGUAGE_ORDER } from "@/lib/editor/languages";
import { errorMessage } from "@/lib/services/errors";
import { cn } from "@/lib/utils/cn";

// Monaco is heavy: load it only in the browser, only on this page.
const CodeEditor = dynamic(() => import("./code-editor").then((m) => m.CodeEditor), { ssr: false, loading: () => <EditorSkeleton /> });

export interface ArenaWorkspaceProps {
  problem: Problem;
  /** Official contest the submission belongs to, if any. */
  contestId: string | null;
  /** Shown above the statement, e.g. "Practice — unofficial" notices. */
  notice?: React.ReactNode;
  editorial?: string;
  historySignal: number;
}

type MobileTab = "problem" | "code" | "result";

export function ArenaWorkspace({ problem, contestId, notice, editorial, historySignal }: ArenaWorkspaceProps) {
  const [prefs, setPrefs] = usePreferences();
  const allowed = LANGUAGE_ORDER.filter((l) => problem.languages.includes(l));
  const defaultLanguage = allowed.includes(prefs.defaultLanguage) ? prefs.defaultLanguage : allowed[0];
  const { language, setLanguage, code, setCode, reset, ready } = useCodeDraft(problem.id, defaultLanguage);

  const isDesktop = useMediaQuery("(min-width: 1024px)", true);
  const [mobileTab, setMobileTab] = useState<MobileTab>("problem");
  const [resultsTab, setResultsTab] = useState<ResultsTab>("tests");
  const [expanded, setExpanded] = useState(false);
  const [resultsCollapsed, setResultsCollapsed] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [outcome, setOutcome] = useState<SimulatedOutcome>("auto");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const problemPanel = usePanelRef();
  const resultsPanel = usePanelRef();
  const run = useRunCode();
  const create = useCreateSubmission();
  const tracker = useSubmissionTracker();
  const judging = !!tracker.submission && tracker.submission.status !== "completed";

  // The header's "history" button opens the submissions tab.
  useEffect(() => {
    if (!historySignal) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- responding to an external signal
    setResultsTab("submissions");
    setMobileTab("result");
    resultsPanel.current?.expand();
  }, [historySignal, resultsPanel]);

  const showResults = () => {
    setResultsTab("result");
    setMobileTab("result");
    if (resultsPanel.current?.isCollapsed()) resultsPanel.current.expand();
  };

  const handleRun = () => {
    if (run.isPending) return;
    tracker.clear();
    setRunError(null);
    showResults();
    run.mutate(
      { problemId: problem.id, language, source: code },
      {
        onSuccess: (r) => setRunResult(r),
        onError: (e) => setRunError(errorMessage(e)),
      },
    );
  };

  const handleSubmit = () => {
    if (create.isPending || judging) return;
    showResults();
    create.mutate(
      { problemId: problem.id, contestId, language, source: code, simulateVerdict: outcome },
      {
        onSuccess: (s) => {
          setRunResult(null);
          tracker.track(s);
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  // Expanded editor: collapse the statement panel (desktop) and exit on Escape.
  useEffect(() => {
    if (!isDesktop) return;
    if (expanded) problemPanel.current?.collapse();
    else problemPanel.current?.expand();
  }, [expanded, isDesktop, problemPanel]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const busyRun = run.isPending;
  const busySubmit = create.isPending || judging;

  const toolbar = (
    <div className="flex h-10 shrink-0 items-center gap-1.5 border-b border-border bg-card px-2">
      <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
        <SelectTrigger size="sm" className="h-7 w-[96px] text-xs" aria-label="Language">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allowed.map((l) => (
            <SelectItem key={l} value={l}>
              {LANGUAGES[l].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="font-mono text-[11px] whitespace-nowrap text-muted-foreground">{LANGUAGES[language].version}</span>
      <span className="hidden items-center gap-1 text-[11px] whitespace-nowrap text-muted-foreground 2xl:flex" aria-live="polite">
        {ready && (
          <>
            <CloudCheck className="size-3.5" /> Draft saved locally
          </>
        )}
      </span>
      <div className="ml-auto flex items-center gap-0.5">
        <div className="mr-1 flex items-center rounded-md border border-border">
          <Hint label="Smaller font">
            <Button variant="ghost" size="icon-xs" className="rounded-r-none" onClick={() => setPrefs({ editorFontSize: Math.max(11, prefs.editorFontSize - 1) })} aria-label="Decrease font size">
              <Minus />
            </Button>
          </Hint>
          <span className="w-7 text-center font-mono text-[11px] tabular" aria-label="Font size">
            {prefs.editorFontSize}
          </span>
          <Hint label="Larger font">
            <Button variant="ghost" size="icon-xs" className="rounded-l-none" onClick={() => setPrefs({ editorFontSize: Math.min(22, prefs.editorFontSize + 1) })} aria-label="Increase font size">
              <Plus />
            </Button>
          </Hint>
        </div>
        <Hint label={prefs.wordWrap ? "Disable word wrap" : "Enable word wrap"}>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-pressed={prefs.wordWrap}
            className={cn(prefs.wordWrap && "bg-accent text-foreground")}
            onClick={() => setPrefs({ wordWrap: !prefs.wordWrap })}
            aria-label="Toggle word wrap"
          >
            <WrapText />
          </Button>
        </Hint>
        <Hint label="Reset to starter code">
          <Button variant="ghost" size="icon-xs" onClick={() => setResetOpen(true)} aria-label="Reset code">
            <RotateCcw />
          </Button>
        </Hint>
        {isDesktop && (
          <Hint label={expanded ? "Exit focus mode (Esc)" : "Focus editor"}>
            <Button variant="ghost" size="icon-xs" onClick={() => setExpanded((v) => !v)} aria-label={expanded ? "Exit expanded editor" : "Expand editor"} aria-pressed={expanded}>
              {expanded ? <Minimize2 /> : <Maximize2 />}
            </Button>
          </Hint>
        )}
      </div>
    </div>
  );

  const editor = (
    <div className="relative min-h-0 flex-1 bg-editor">
      {ready ? (
        <CodeEditor
          value={code}
          onChange={setCode}
          language={language}
          fontSize={prefs.editorFontSize}
          wordWrap={prefs.wordWrap}
          minimap={prefs.minimap && isDesktop}
          onRun={handleRun}
          onSubmit={handleSubmit}
          ariaLabel={`${LANGUAGES[language].label} solution for ${problem.title}`}
        />
      ) : (
        <EditorSkeleton />
      )}
    </div>
  );

  const actions = (
    <div className="flex items-center gap-2">
      <span className="mr-auto hidden items-center gap-1 text-[11px] text-muted-foreground xl:flex">
        <Kbd>Ctrl</Kbd>
        <Kbd>&apos;</Kbd> run
        <span className="mx-1">·</span>
        <Kbd>Ctrl</Kbd>
        <Kbd>Enter</Kbd> submit
      </span>
      <Button variant="outline" size="sm" onClick={handleRun} disabled={busyRun || !ready} className="flex-1 sm:flex-none">
        {busyRun ? <Loader2 className="animate-spin" /> : <Play />} Run
      </Button>
      <Button size="sm" variant="success" onClick={handleSubmit} disabled={busySubmit || !ready} className="flex-1 sm:flex-none">
        {busySubmit ? <Loader2 className="animate-spin" /> : <Send />} {busySubmit ? "Judging…" : "Submit"}
      </Button>
    </div>
  );

  const statement = (
    <div className="h-full overflow-y-auto px-5 py-5 scrollbar-thin sm:px-6">
      {notice}
      <ProblemStatement problem={problem} editorial={editorial} />
    </div>
  );

  const results = (
    <ResultsPanel
      problem={problem}
      tab={resultsTab}
      onTabChange={setResultsTab}
      running={busyRun}
      runResult={runResult}
      runError={runError}
      submission={tracker.submission}
      outcome={outcome}
      onOutcomeChange={setOutcome}
      headerAction={
        isDesktop ? (
          <Hint label={resultsCollapsed ? "Show console" : "Hide console"}>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => (resultsCollapsed ? resultsPanel.current?.expand() : resultsPanel.current?.collapse())}
              aria-label={resultsCollapsed ? "Show console" : "Hide console"}
            >
              {resultsCollapsed ? <PanelBottomOpen /> : <PanelBottomClose />}
            </Button>
          </Hint>
        ) : null
      }
    />
  );

  const resetDialog = (
    <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset your {LANGUAGES[language].label} code?</AlertDialogTitle>
          <AlertDialogDescription>Your local draft for this problem will be replaced with the starter template. Previous submissions are not affected.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction destructive onClick={reset}>
            Reset code
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (!isDesktop) {
    const tabs: { id: MobileTab; label: string; icon: typeof FileText }[] = [
      { id: "problem", label: "Problem", icon: FileText },
      { id: "code", label: "Code", icon: AlignJustify },
      { id: "result", label: "Result", icon: SquareTerminal },
    ];
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div role="tablist" aria-label="Workspace" className="flex shrink-0 border-b border-border bg-card">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={mobileTab === t.id}
              onClick={() => setMobileTab(t.id)}
              className={cn(
                "relative flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors",
                mobileTab === t.id && "text-foreground after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary",
              )}
            >
              <t.icon className="size-4" />
              {t.label}
              {t.id === "result" && (busyRun || judging) && <Loader2 className="size-3.5 animate-spin text-primary" />}
            </button>
          ))}
        </div>
        {/* Panes stay mounted so the editor keeps its state across tabs. */}
        <div className={cn("min-h-0 flex-1", mobileTab !== "problem" && "hidden")}>{statement}</div>
        <div className={cn("min-h-0 flex-1 flex-col", mobileTab === "code" ? "flex" : "hidden")}>
          {toolbar}
          {editor}
        </div>
        <div className={cn("min-h-0 flex-1", mobileTab !== "result" && "hidden")}>{results}</div>
        <div className="shrink-0 border-t border-border bg-card px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">{actions}</div>
        {resetDialog}
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1">
      <Group orientation="horizontal" className="h-full">
        <Panel panelRef={problemPanel} id="statement" defaultSize="42%" minSize="26%" collapsible collapsedSize="0%" className="bg-card" onResize={(size) => setExpanded(size.asPercentage === 0)}>
          {statement}
        </Panel>
        <Separator className="group relative w-px bg-border outline-none data-[separator]:hover:bg-primary/60 focus-visible:bg-primary">
          <span className="absolute inset-y-0 -left-1 -right-1" />
        </Separator>
        <Panel id="workspace" minSize="34%">
          <Group orientation="vertical" className="h-full">
            <Panel id="editor" defaultSize="64%" minSize="25%">
              <div className="flex h-full flex-col">
                {toolbar}
                {editor}
                <div className="shrink-0 border-t border-border bg-card px-3 py-2">{actions}</div>
              </div>
            </Panel>
            <Separator className="relative h-px bg-border outline-none hover:bg-primary/60 focus-visible:bg-primary">
              <span className="absolute inset-x-0 -top-1 -bottom-1" />
            </Separator>
            <Panel
              panelRef={resultsPanel}
              id="results"
              defaultSize="36%"
              minSize="18%"
              collapsible
              collapsedSize="40px"
              onResize={(size) => setResultsCollapsed(size.inPixels <= 41)}
            >
              {results}
            </Panel>
          </Group>
        </Panel>
      </Group>
      {resetDialog}
    </div>
  );
}
