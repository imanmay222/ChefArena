import { redirect } from "next/navigation";

// proxy.ts already routes "/" based on the demo session; this is a fallback.
export default function Home() {
  redirect("/dashboard");
}
