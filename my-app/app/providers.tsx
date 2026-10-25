"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ServiceError } from "@/lib/services/errors";
import { usePreferences } from "@/hooks/use-preferences";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="bottom-right"
      mobileOffset={{ bottom: 76 }}
      toastOptions={{
        classNames: {
          toast: "!bg-popover !border-border !text-popover-foreground !shadow-pop !rounded-lg",
          description: "!text-muted-foreground",
        },
      }}
    />
  );
}

/** Applies display preferences that live outside React's tree (e.g. table density). */
function PreferenceEffects() {
  const [prefs] = usePreferences();
  useEffect(() => {
    document.documentElement.dataset.density = prefs.compactTables ? "compact" : "comfortable";
  }, [prefs.compactTables]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (count, error) => !(error instanceof ServiceError && ["unauthorized", "forbidden", "not_found"].includes(error.code)) && count < 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <TooltipProvider delayDuration={250}>
            {children}
            <ThemedToaster />
            <PreferenceEffects />
          </TooltipProvider>
        </MotionConfig>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
