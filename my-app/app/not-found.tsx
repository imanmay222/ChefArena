import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/layout/brand";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative">
        <BrandMark className="mx-auto mb-6 size-10" />
        <p className="font-mono text-sm text-primary">404 · Not Found</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">This page isn&apos;t on the menu</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          The contest, problem or page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild>
            <Link href="/dashboard">
              <Compass /> Back to overview
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contests">Browse contests</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
