"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser, useNotifications } from "@/lib/queries";
import { isActive, visibleSections } from "@/lib/navigation";
import { Hint } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";

export function NavList({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const { data: notifications } = useNotifications();
  const unread = notifications?.filter((n) => !n.read).length ?? 0;
  const sections = visibleSections(user?.role);

  return (
    <nav aria-label="Primary" className="flex flex-col gap-5">
      {sections.map((section) => (
        <div key={section.id}>
          {collapsed ? (
            <div className="mx-auto mb-2 h-px w-6 bg-border" aria-hidden />
          ) : (
            <p className="mb-1.5 px-3 text-[10.5px] font-medium tracking-[0.12em] text-muted-foreground/80 uppercase">{section.label}</p>
          )}
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = isActive(pathname, item);
              const badge = item.badge === "notifications" && unread > 0 ? unread : null;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Hint label={item.label} side="right" disabled={!collapsed}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex h-8 items-center gap-2.5 rounded-md px-3 text-[13px] font-medium text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                        collapsed && "mx-auto w-9 justify-center px-0",
                        active && "bg-primary-soft text-foreground hover:bg-primary-soft",
                      )}
                    >
                      {active && <span className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-r-full bg-primary" aria-hidden />}
                      <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {badge !== null &&
                        (collapsed ? (
                          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" aria-label={`${badge} unread`} />
                        ) : (
                          <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] leading-4 font-semibold text-primary-foreground tabular">{badge}</span>
                        ))}
                    </Link>
                  </Hint>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function NavListFallback({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 px-1" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className={cn("h-8 animate-pulse rounded-md bg-muted/60", collapsed && "mx-auto w-9")} />
      ))}
    </div>
  );
}
