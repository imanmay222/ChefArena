import { ArrowRight } from "lucide-react";
import { RoleBadge } from "@/components/auth/role-badge";
import { focusRing } from "@/components/ui/button";
import { DEMO_ACCOUNTS } from "@/lib/auth/demo-accounts";
import { ROLE_CONFIG } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import type { DemoAccount } from "@/types/auth";

interface DemoAccountsProps {
  onSelect: (account: DemoAccount) => void;
  disabled?: boolean;
}

export function DemoAccounts({ onSelect, disabled }: DemoAccountsProps) {
  return (
    <section aria-labelledby="demo-accounts-title">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="demo-accounts-title" className="text-xs font-medium text-foreground">
          Demo accounts
        </h2>
        <p className="text-[11px] text-muted">Select one to fill the form</p>
      </div>

      <ul className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border bg-elevated/60">
        {DEMO_ACCOUNTS.map((account) => (
          <li key={account.email}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(account)}
              aria-label={`Use ${ROLE_CONFIG[account.role].label} demo account, ${account.email}`}
              className={cn(
                "group flex w-full cursor-pointer items-center gap-3 px-3.5 py-2 text-left transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-60",
                focusRing,
                "focus-visible:ring-inset focus-visible:ring-offset-0",
              )}
            >
              <span className="min-w-0 flex-1">
                <RoleBadge role={account.role} />
                <span className="mt-1 flex flex-wrap items-baseline gap-x-2 font-mono text-xs">
                  <span className="truncate text-foreground">{account.email}</span>
                  <span className="text-muted">{account.password}</span>
                </span>
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-muted transition-colors group-hover:text-primary">
                Use
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
