"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Submission } from "@/types";
import { services } from "@/lib/services";
import { invalidateAfterVerdict } from "@/lib/queries";
import { VERDICT_META } from "@/lib/utils/format";

/**
 * Follows one submission through queued → compiling → running → verdict.
 * The mock adapter streams updates from timers; the Go backend will push
 * them over a WebSocket behind the same `watchSubmission` contract.
 */
export function useSubmissionTracker() {
  const qc = useQueryClient();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const unsubscribe = useRef<(() => void) | null>(null);

  useEffect(() => () => unsubscribe.current?.(), []);

  const track = useCallback(
    (initial: Submission) => {
      unsubscribe.current?.();
      setSubmission(initial);
      unsubscribe.current = services.submissions.watchSubmission(initial.id, (update) => {
        setSubmission(update.submission);
        if (update.status === "completed" && update.verdict) {
          unsubscribe.current?.();
          unsubscribe.current = null;
          invalidateAfterVerdict(qc, update.submission.kind === "contest" ? update.submission.contestId : null);
          const meta = VERDICT_META[update.verdict];
          const message = `${meta.label} · ${update.submission.id}`;
          if (update.verdict === "accepted") toast.success(message, { description: "Simulated verdict — standings and solve counts updated." });
          else toast.error(message, { description: "Simulated verdict — open the Result tab for details." });
        }
      });
    },
    [qc],
  );

  const clear = useCallback(() => {
    unsubscribe.current?.();
    unsubscribe.current = null;
    setSubmission(null);
  }, []);

  return { submission, track, clear };
}
