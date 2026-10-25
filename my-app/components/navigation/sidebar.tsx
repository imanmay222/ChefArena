"use client";

import { Suspense } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/tooltip";
import { setSidebarCollapsed, useSidebarCollapsed } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils/cn";
import { NavList, NavListFallback } from "./nav-list";
import { SidebarUser } from "./sidebar-user";

export function Sidebar() {
  const collapsed = useSidebarCollapsed();
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-border", collapsed ? "justify-center px-2" : "justify-between px-4")}>
        <Brand collapsed={collapsed} tagline={false} />
        {!collapsed && (
          <Hint label="Collapse sidebar" side="right">
            <Button variant="ghost" size="icon-xs" onClick={() => setSidebarCollapsed(true)} aria-label="Collapse sidebar">
              <PanelLeftClose />
            </Button>
          </Hint>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin">
        <Suspense fallback={<NavListFallback collapsed={collapsed} />}>
          <NavList collapsed={collapsed} />
        </Suspense>
      </div>
      <div className="border-t border-border p-2">
        {collapsed && (
          <Hint label="Expand sidebar" side="right">
            <Button variant="ghost" size="icon-sm" className="mx-auto mb-1 flex" onClick={() => setSidebarCollapsed(false)} aria-label="Expand sidebar">
              <PanelLeftOpen />
            </Button>
          </Hint>
        )}
        <SidebarUser collapsed={collapsed} />
      </div>
    </aside>
  );
}
