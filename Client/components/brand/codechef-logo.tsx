import Image from "next/image";
import { cn } from "@/lib/utils";

// Official logo from CodeChef's CDN (cdn.codechef.com/images/cc-logo.svg),
// bundled locally so the page never depends on a third-party image URL.
// CodeChef is a trademark of its owner; ChefArena is not a CodeChef product.
export function CodeChefLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/codechef-logo.svg"
      alt="CodeChef"
      width={258}
      height={100}
      unoptimized
      priority
      className={cn("h-10 w-auto", className)}
    />
  );
}
