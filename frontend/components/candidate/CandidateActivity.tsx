import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";
import { formatRenewsOn, type SubscriptionInfo } from "@/lib/account";
import type { ApplicationRow } from "./types";
import ApplicationStatusBadge from "./ApplicationStatusBadge";

interface Props {
  counts: { applications: number; underReview: number; shortlisted: number; saved: number };
  latest: ApplicationRow | null;
  profileStrength: number;
  subscription: SubscriptionInfo;
}

const label = "text-[12px] font-sans font-semibold uppercase tracking-[0.22em] text-muted";

export default function CandidateActivity({ counts, latest, profileStrength, subscription }: Props) {
  const stats = [
    { value: counts.applications, label: "Applications" },
    { value: counts.underReview,  label: "Under review" },
    { value: counts.shortlisted,  label: "Shortlisted" },
    { value: counts.saved,        label: "Saved" },
  ];

  return (
    <aside className="bg-white border border-border rounded-[8px] divide-y divide-border lg:sticky lg:top-[76px]">
      <section className="p-5">
        <p className={label}>Your activity</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dd className="font-sans text-[28px] font-semibold text-navy leading-none tabular-nums">{s.value}</dd>
              <dt className="mt-1 text-[13.5px] font-sans text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="p-5">
        <p className={label}>Application update</p>
        {latest ? (
          <div className="mt-3">
            <Link href={`/jobs/${latest.jobId}`} className="block text-[16px] font-sans font-semibold text-navy hover:text-brass transition-colors leading-snug">
              {latest.jobTitle}
            </Link>
            <p className="mt-0.5 text-[14.5px] font-sans text-muted">{latest.company}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <ApplicationStatusBadge status={latest.status} />
              <span className="text-[13px] font-sans text-muted">Updated {formatRelativeDate(latest.appliedAt).toLowerCase()}</span>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-[14.5px] font-sans text-muted">No applications yet.</p>
            <Link href="/jobs" className="mt-2 inline-block text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass transition-colors">
              Browse roles →
            </Link>
          </div>
        )}
      </section>

      <section className="p-5">
        <p className={label}>Profile</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[16px] font-sans font-semibold text-navy">{profileStrength}% complete</span>
          <Link href="/profile" className="text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass transition-colors">
            Complete →
          </Link>
        </div>
        <div className="mt-2.5 h-[4px] w-full bg-track rounded-full overflow-hidden">
          <div className="h-full bg-brass rounded-full" style={{ width: `${Math.max(profileStrength, 3)}%` }} />
        </div>
      </section>

      <section className="p-5">
        <div className="flex items-center justify-between">
          <p className={label}>Subscription</p>
          <span className={`text-[12px] font-sans font-bold tracking-[0.16em] px-2 py-0.5 border rounded-[3px] ${
            subscription.active ? "text-brass border-brass/50 bg-highlight" : "text-muted border-border"
          }`}>
            {subscription.active ? subscription.plan : "FREE"}
          </span>
        </div>
        <p className="mt-2.5 text-[14.5px] font-sans text-muted leading-relaxed">
          {subscription.active
            ? `Active until ${formatRenewsOn(subscription.renewsOn)}.`
            : `${subscription.applicationsThisMonth} of ${subscription.applicationLimit ?? 0} free applications used this month.`}
        </p>
        <Link href="/subscription" className="mt-2 inline-block text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass transition-colors">
          {subscription.active ? "Manage →" : "View plans →"}
        </Link>
      </section>
    </aside>
  );
}
