import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function ArenaSkeleton() {
  return (
    <div className="flex h-dvh flex-col" aria-busy aria-label="Loading arena">
      <div className="flex h-12 items-center gap-3 border-b border-border bg-sidebar px-3">
        <Skeleton className="size-8" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mx-auto h-7 w-36" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid flex-1 lg:grid-cols-[42%_1fr]">
        <div className="hidden space-y-3 border-r border-border bg-card p-6 lg:block">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-6 h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="bg-editor" />
      </div>
    </div>
  );
}

export function ArenaMessage({
  icon: Icon,
  title,
  description,
  action,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  action: string;
  href: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-border bg-card">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</div>
      <Button asChild className="mt-5">
        <Link href={href}>{action}</Link>
      </Button>
    </div>
  );
}
