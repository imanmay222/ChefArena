"use client";

import { Suspense, useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/layout/brand";
import { NavList, NavListFallback } from "./nav-list";
import { SidebarUser } from "./sidebar-user";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open navigation">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">Main navigation</SheetDescription>
        <div className="flex h-14 items-center border-b border-border px-4">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin">
          <Suspense fallback={<NavListFallback />}>
            <NavList onNavigate={() => setOpen(false)} />
          </Suspense>
        </div>
        <div className="border-t border-border p-2">
          <SidebarUser />
        </div>
      </SheetContent>
    </Sheet>
  );
}
