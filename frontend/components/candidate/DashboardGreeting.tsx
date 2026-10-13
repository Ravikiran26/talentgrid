import Link from "next/link";
import ProfileStrengthCard from "./ProfileStrengthCard";
import type { ApplicationRow } from "./types";

interface Props {
  firstName: string;
  summary: string;
  weeklyMatches: number;
  strength: number;
  missing: string[];
  /** Most recent shortlisted application, shown once the profile is complete. */
  shortlisted: ApplicationRow | null;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const label = "text-[12px] font-sans font-semibold uppercase tracking-[0.22em]";
const action = "mt-4 inline-flex items-center gap-1.5 text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass transition-colors";

export default function DashboardGreeting({ firstName, summary, weeklyMatches, strength, missing, shortlisted }: Props) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
      <div className="bg-white border border-border rounded-[8px] px-7 py-6 flex flex-col justify-center">
        <p className={`${label} tracking-[0.24em] text-brass`}>My career</p>
        <h1 className="mt-2 font-serif text-[2.04rem] lg:text-[2.31rem] font-semibold text-navy leading-[1.1] tracking-tight">
          {greeting()}, {firstName}.
        </h1>
        <p className="mt-2 text-[16px] font-sans text-charcoal">{summary}</p>
        {weeklyMatches > 0 && (
          <p className="mt-3 inline-flex items-center gap-2 text-[14.5px] font-sans text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-brass" />
            {weeklyMatches} new opportunities match your profile this week.
          </p>
        )}
      </div>

      <div className="bg-white border border-border rounded-[8px] px-6 py-5">
        {missing.length > 0 ? (
          <ProfileStrengthCard strength={strength} missing={missing} />
        ) : shortlisted ? (
          <div className="h-full flex flex-col justify-center">
            <p className={`${label} text-[#2F7D55]`}>You&apos;re shortlisted</p>
            <Link href={`/applications/${shortlisted.id}`}
              className="mt-2 block text-[17px] font-sans font-semibold text-navy hover:text-brass transition-colors leading-snug">
              {shortlisted.jobTitle}
            </Link>
            <p className="mt-0.5 text-[14.5px] font-sans text-muted">{shortlisted.company}</p>
            <Link href={`/applications/${shortlisted.id}`} className={action}>
              View application <span aria-hidden>→</span>
            </Link>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center">
            <p className={`${label} text-muted`}>Profile</p>
            <p className="mt-2 text-[16px] font-sans font-semibold text-navy">Complete and visible to employers.</p>
            <Link href="/profile" className={action}>
              View profile <span aria-hidden>→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
