import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeArena } from "@/components/editor/practice-arena";
import { ArenaSkeleton } from "@/components/editor/arena-states";

export const metadata: Metadata = { title: "Practice" };

export default function PracticeProblemPage({ params }: PageProps<"/problems/[problemId]">) {
  return (
    <Suspense fallback={<ArenaSkeleton />}>
      {params.then(({ problemId }) => (
        <PracticeArena problemId={problemId} />
      ))}
    </Suspense>
  );
}
