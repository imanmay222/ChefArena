"use client";

import { useEffect, useRef } from "react";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import type { Language } from "@/types";
import { LANGUAGES } from "@/lib/editor/languages";
import { Skeleton } from "@/components/ui/skeleton";

const defineThemes: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("chefarena-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5b6478", fontStyle: "italic" },
      { token: "keyword", foreground: "b48bff" },
      { token: "string", foreground: "7ee2a8" },
      { token: "number", foreground: "f5b971" },
      { token: "type", foreground: "7cc7ff" },
    ],
    colors: {
      "editor.background": "#0f131b",
      "editor.foreground": "#e2e8f0",
      "editorGutter.background": "#0f131b",
      "editor.lineHighlightBackground": "#151b2799",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#3b4458",
      "editorLineNumber.activeForeground": "#94a3b8",
      "editor.selectionBackground": "#6c5ce74d",
      "editor.inactiveSelectionBackground": "#6c5ce726",
      "editorCursor.foreground": "#a99ff5",
      "editorIndentGuide.background1": "#1b2230",
      "editorIndentGuide.activeBackground1": "#323b4e",
      "editorWidget.background": "#151b27",
      "editorWidget.border": "#252c3b",
      "scrollbarSlider.background": "#323b4e66",
      "scrollbarSlider.hoverBackground": "#323b4e99",
    },
  });
  monaco.editor.defineTheme("chefarena-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "94a3b8", fontStyle: "italic" },
      { token: "keyword", foreground: "5b4be8" },
      { token: "string", foreground: "15803d" },
      { token: "number", foreground: "b45309" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editorGutter.background": "#ffffff",
      "editor.lineHighlightBackground": "#f0f3f9",
      "editor.lineHighlightBorder": "#00000000",
      "editorLineNumber.foreground": "#cbd5e1",
      "editorLineNumber.activeForeground": "#64748b",
      "editor.selectionBackground": "#5b4be833",
      "editorCursor.foreground": "#5b4be8",
      "editorIndentGuide.background1": "#eef1f6",
    },
  });
};

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  fontSize: number;
  wordWrap: boolean;
  minimap?: boolean;
  readOnly?: boolean;
  onRun?: () => void;
  onSubmit?: () => void;
  ariaLabel?: string;
}

export function CodeEditor({ value, onChange, language, fontSize, wordWrap, minimap = false, readOnly, onRun, onSubmit, ariaLabel }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const actions = useRef({ onRun, onSubmit });

  useEffect(() => {
    actions.current = { onRun, onSubmit };
  }, [onRun, onSubmit]);

  const onMount: OnMount = (editor, monaco) => {
    // Ctrl/Cmd + Enter → submit, Ctrl/Cmd + ' → run samples.
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => actions.current.onSubmit?.());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Quote, () => actions.current.onRun?.());
  };

  return (
    <Editor
      height="100%"
      language={LANGUAGES[language].monacoId}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      theme={resolvedTheme === "light" ? "chefarena-light" : "chefarena-dark"}
      beforeMount={defineThemes}
      onMount={onMount}
      loading={<EditorSkeleton />}
      options={{
        fontSize,
        fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
        fontLigatures: true,
        lineHeight: Math.round(fontSize * 1.6),
        wordWrap: wordWrap ? "on" : "off",
        minimap: { enabled: minimap },
        readOnly,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        renderLineHighlight: "all",
        padding: { top: 12, bottom: 12 },
        tabSize: 4,
        bracketPairColorization: { enabled: true },
        guides: { indentation: true, bracketPairs: false },
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
        fixedOverflowWidgets: true,
        ariaLabel: ariaLabel ?? "Code editor",
      }}
    />
  );
}

export function EditorSkeleton() {
  return (
    <div className="h-full w-full space-y-2.5 bg-editor p-4" aria-label="Loading editor">
      {[60, 40, 72, 30, 55, 48, 66, 20].map((w, i) => (
        <Skeleton key={i} className="h-3.5" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}
