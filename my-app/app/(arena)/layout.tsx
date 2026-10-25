import { SessionWatcher } from "@/components/layout/session-watcher";

/** Full-screen coding workspace without the application sidebar. */
export default function ArenaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      {children}
      <SessionWatcher />
    </div>
  );
}
