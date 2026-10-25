import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-elevated px-3.5 text-base text-foreground transition-colors sm:text-sm",
        "placeholder:text-muted/70 hover:border-border-strong",
        "outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25",
        "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/25",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

export function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="text-xs text-danger">
      {children}
    </p>
  );
}
