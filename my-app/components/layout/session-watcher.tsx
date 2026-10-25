"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/queries";

/** Sends the user back to /login if the demo session no longer resolves to an active user. */
export function SessionWatcher() {
  const router = useRouter();
  const { data, isSuccess } = useCurrentUser();
  useEffect(() => {
    if (isSuccess && !data) router.replace("/login");
  }, [isSuccess, data, router]);
  return null;
}
