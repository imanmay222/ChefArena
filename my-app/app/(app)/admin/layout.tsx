import { AdminGate } from "@/components/admin/admin-gate";

/*
 * Admin pages are withheld until the client knows the user's role, so they
 * cannot be part of a prefetched static shell. Each admin page therefore
 * exports `instant = false` to opt out of instant-navigation validation
 * instead of rendering admin UI speculatively.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
