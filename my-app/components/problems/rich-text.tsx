import { Fragment } from "react";

/** Minimal, safe inline formatting for statements: `code` and **bold**. No HTML is injected. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1)
          return (
            <code key={i} className="rounded border border-border bg-surface-2 px-1 py-px font-mono text-[0.86em] text-foreground">
              {part.slice(1, -1)}
            </code>
          );
        if (part.startsWith("**") && part.endsWith("**") && part.length > 3)
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
