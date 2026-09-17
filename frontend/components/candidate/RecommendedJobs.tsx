"use client";

import Link from "next/link";
import type { Job } from "@/types";
import type { MatchResult } from "@/lib/match";
import JobMatchCard from "./JobMatchCard";

export interface RecommendedJob {
  job: Job;
  match: MatchResult | null;
}

interface Props {
  items: RecommendedJob[];
  loading: boolean;
  savedIds: string[];
  onToggleSave: (jobId: string) => void;
}

export default function RecommendedJobs({ items, loading, savedIds, onToggleSave }: Props) {
  return (
    <section aria-labelledby="recommended-heading">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 id="recommended-heading" className="font-sans text-[20px] font-semibold text-navy tracking-tight">Recommended for you</h2>
          <p className="mt-0.5 text-[14.5px] font-sans text-muted">Based on your experience, skills and preferences.</p>
        </div>
        <Link href="/jobs" className="text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass transition-colors whitespace-nowrap">
          View all opportunities →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white border border-border rounded-[8px] h-[188px] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-border rounded-[8px] py-14 text-center">
          <p className="text-[15.5px] font-sans text-muted">No opportunities available right now.</p>
          <Link href="/jobs" className="mt-3 inline-block text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass">Browse all roles →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(({ job, match }) => (
            <JobMatchCard key={job.id} job={job} match={match} saved={savedIds.includes(job.id)} onToggleSave={onToggleSave} />
          ))}
        </div>
      )}
    </section>
  );
}
