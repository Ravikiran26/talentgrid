"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { getUser } from "@/lib/auth";
import {
  fetchSubscription, upgradeSubscription, cancelSubscription, formatRenewsOn,
  FREE_SUBSCRIPTION, type SubscriptionInfo,
} from "@/lib/account";

const PLANS = [
  { key: "FREE", name: "Free", price: "₹0",           features: ["Browse all opportunities", "Build your profile", "Apply to 3 roles / month"] },
  { key: "PRO",  name: "PRO",  price: "₹999 / month", features: ["Unlimited applications", "Priority profile visibility", "Match intelligence on every role"] },
] as const;

export default function SubscriptionPage() {
  const router = useRouter();
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "CANDIDATE") { router.push("/"); return; }
    fetchSubscription().then(setSub);
  }, [router]);

  async function run(action: () => Promise<SubscriptionInfo>) {
    setBusy(true);
    setError(null);
    try {
      setSub(await action());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!sub) return <div className="min-h-screen bg-ivory" aria-busy="true" />;
  const s = sub ?? FREE_SUBSCRIPTION;

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-screen-lg mx-auto px-6 lg:px-10 py-8">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-1">
            Account
          </p>
          <h1 className="font-serif text-3xl font-bold text-surface">Subscription</h1>
          <p className="text-[15px] font-sans text-navy-text mt-1">
            {s.active
              ? `PRO active until ${formatRenewsOn(s.renewsOn)}`
              : `You're on the Free plan · ${s.applicationsThisMonth} of ${s.applicationLimit ?? 0} applications used this month`}
          </p>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-6 lg:px-10 py-10">
        {error && (
          <p className="mb-5 flex items-center gap-2 text-[14px] font-sans text-red-600 bg-red-50 border border-red-200 px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PLANS.map((p) => {
            const current = s.plan === p.key;
            return (
              <div key={p.key} className={`border bg-surface p-7 ${current ? "border-brass" : "border-border"}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-brass">{p.name}</p>
                  {current && (
                    <span className="text-[11px] font-sans font-bold uppercase tracking-[0.16em] text-brass border border-brass/50 px-2 py-0.5">Current plan</span>
                  )}
                </div>
                <p className="font-serif text-3xl font-bold text-navy mb-5">{p.price}</p>
                <ul className="space-y-2.5 mb-7">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[15px] font-sans text-charcoal">
                      <CheckCircle2 className="w-4 h-4 text-brass flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                {p.key === "PRO" ? (
                  s.active ? (
                    <button type="button" disabled={busy} onClick={() => run(cancelSubscription)}
                      className="w-full py-3 text-[13px] font-sans font-semibold uppercase tracking-[0.18em] text-navy border border-navy hover:bg-navy hover:text-surface transition-colors disabled:opacity-60">
                      {busy ? "Working…" : "Cancel PRO"}
                    </button>
                  ) : (
                    <button type="button" disabled={busy} onClick={() => run(upgradeSubscription)}
                      className="w-full py-3 text-[13px] font-sans font-semibold uppercase tracking-[0.18em] text-surface bg-brass hover:bg-brass-hover transition-colors disabled:opacity-60">
                      {busy ? "Working…" : "Upgrade to PRO →"}
                    </button>
                  )
                ) : (
                  <p className="text-[13px] font-sans text-muted">Free forever. No card required.</p>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-[13px] font-sans text-muted">
          Payments are not yet connected. Upgrading activates PRO for 30 days immediately so the full flow can be tested.
        </p>
      </div>
    </div>
  );
}
