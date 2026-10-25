import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover disabled:hover:bg-primary",
  secondary:
    "border border-border bg-surface text-foreground hover:border-border-strong hover:bg-elevated",
  ghost: "text-muted hover:bg-elevated hover:text-foreground",
} as const;

const sizes = {
  sm: "h-8 gap-1.5 rounded-md px-2.5 text-xs",
  md: "h-10 gap-2 rounded-lg px-3.5 text-sm",
  lg: "h-11 gap-2 rounded-lg px-4 text-sm",
  icon: "size-10 rounded-lg",
} as const;

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        focusRing,
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
