import type { Metadata } from "next";
import { Suspense } from "react";
import { ContestArena } from "@/components/editor/contest-arena";
import { ArenaSkeleton } from "@/components/editor/arena-states";

export const metadata: Metadata = { title: "Contest arena" };

export default function ContestProblemPage({ params }: PageProps<"/contests/[contestId]/problems/[problemId]">) {
  return (
    <Suspense fallback={<ArenaSkeleton />}>
      {params.then(({ contestId, problemId }) => (
        <ContestArena contestId={contestId} problemId={problemId} />
      ))}
    </Suspense>
  );
}
