"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SEGMENT_LABEL } from "@/lib/navigation";
import { useContests } from "@/lib/queries";

export function Breadcrumbs() {
  const pathname = usePathname();
  const { data: contests } = useContests();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    // Some intermediate segments have no page of their own (e.g. /admin/problems/CA105 only has /edit).
    const linkable = segments[i + 1] !== "edit" && !(segment === "problems" && segments[i - 2] === "contests");
    const contest = contests?.find((c) => c.id === segment);
    const label = SEGMENT_LABEL[segment] ?? contest?.shortTitle ?? decodeURIComponent(segment);
    return { href, label, linkable };
  });

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-[13px]">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.href} className={`flex min-w-0 items-center gap-1 ${!last ? "hidden sm:flex" : ""}`}>
              {i > 0 && <ChevronRight className="hidden size-3.5 shrink-0 text-muted-foreground/60 sm:block" />}
              {last || !c.linkable ? (
                <span className={last ? "truncate font-medium text-foreground" : "truncate text-muted-foreground"} aria-current={last ? "page" : undefined}>
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="truncate text-muted-foreground transition-colors hover:text-foreground">
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
