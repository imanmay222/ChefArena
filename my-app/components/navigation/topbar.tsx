import { Suspense } from "react";
import { FlaskConical } from "lucide-react";
import { Hint } from "@/components/ui/tooltip";
import { BrandMark } from "@/components/layout/brand";
import { Breadcrumbs } from "./breadcrumbs";
import { CommandPalette } from "./command-palette";
import { MobileNav } from "./mobile-nav";
import { NotificationsMenu } from "./notifications-menu";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur-md sm:gap-3 sm:px-6 lg:px-8">
      <MobileNav />
      <BrandMark className="size-7 lg:hidden" />
      <div className="min-w-0 flex-1">
        <Suspense fallback={<div className="h-4 w-32 animate-pulse rounded bg-muted" />}>
          <Breadcrumbs />
        </Suspense>
      </div>
      <CommandPalette className="w-8 justify-center px-0 sm:w-64 sm:justify-start sm:px-2.5" />
      <Hint label="All data on this page comes from the local mock adapter">
        <span className="hidden items-center gap-1 rounded-md border border-dashed border-warning/40 px-1.5 py-0.5 text-[11px] font-medium text-warning md:inline-flex">
          <FlaskConical className="size-3" /> Demo data
        </span>
      </Hint>
      <div className="flex items-center gap-0.5">
        <NotificationsMenu />
        <ThemeToggle />
      </div>
      <UserMenu />
    </header>
  );
}
