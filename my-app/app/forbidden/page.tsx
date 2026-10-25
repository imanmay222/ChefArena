import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Access denied" };

export default function ForbiddenPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative">
        <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="size-6 text-destructive" />
        </div>
        <p className="font-mono text-sm text-destructive">403 · Forbidden</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">You don&apos;t have access to this area</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          This section is restricted to CP Leads and Super Admins. If you think you should have access, contact your department&apos;s super admin.
        </p>
        <p className="mx-auto mt-3 max-w-md text-xs text-muted-foreground/80">
          Note: in this demo, access checks run in the browser. In production they are enforced by the Go backend.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link href="/dashboard">Go to overview</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Switch account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
