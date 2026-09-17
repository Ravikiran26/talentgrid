"use client";

import Link from "next/link";
import { Bookmark, Check, TriangleAlert } from "lucide-react";
import type { Job } from "@/types";
import type { MatchResult } from "@/lib/match";
import { formatSalary, formatExperience } from "@/lib/utils";

interface Props {
  job: Job;
  match: MatchResult | null;
  saved: boolean;
  onToggleSave: (jobId: string) => void;
}

export default function JobMatchCard({ job, match, saved, onToggleSave }: Props) {
  return (
    <article className="group bg-white border border-border rounded-[8px] p-5 lg:p-6 transition-all duration-200 hover:border-navy/25 hover:shadow-[0_6px_20px_rgba(7,24,39,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {match && (
            <p className="text-[12.5px] font-sans font-bold uppercase tracking-[0.18em] text-brass">
              {match.percent}% match
            </p>
          )}
          <h3 className="mt-1 font-sans text-[19px] font-semibold text-navy leading-snug">
            <Link href={`/jobs/${job.id}`} className="hover:text-brass transition-colors">{job.title}</Link>
          </h3>
          <p className="mt-0.5 text-[15px] font-sans text-muted">{job.company}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[16px] font-sans font-semibold text-navy">{formatSalary(job.salaryMin, job.salaryMax)}</p>
          <p className="mt-0.5 text-[13.5px] font-sans text-muted">{formatExperience(job.experienceMin, job.experienceMax)}</p>
        </div>
      </div>

      <p className="mt-3 text-[14.5px] font-sans text-muted">
        {job.location}
        <span className="mx-2 text-border">·</span>
        {job.employmentType}
      </p>

      <div className="mt-4 pt-4 border-t border-border">
        {match ? (
          <>
            <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-muted">Why you match</p>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
              {match.matched.slice(0, 4).map((s) => (
                <li key={s} className="inline-flex items-center gap-1.5 text-[14.5px] font-sans text-charcoal">
                  <Check className="w-3.5 h-3.5 text-[#2F7D55]" strokeWidth={2.5} /> {s}
                </li>
              ))}
              {match.missing.slice(0, 1).map((s) => (
                <li key={s} className="inline-flex items-center gap-1.5 text-[14.5px] font-sans text-muted">
                  <TriangleAlert className="w-3.5 h-3.5 text-brass" /> {s} preferred
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-muted">Key requirements</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {job.skills.slice(0, 5).map((s) => (
                <span key={s} className="text-[13.5px] font-sans text-charcoal/80 border border-border rounded-[3px] px-2 py-0.5">{s}</span>
              ))}
              <Link href="/profile?section=skills" className="ml-1 text-[13.5px] font-sans text-brass hover:text-navy transition-colors">
                Add your skills to see your match →
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[13.5px] font-sans text-muted">Posted {job.postedAt}</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => onToggleSave(job.id)}
            aria-label={saved ? "Remove from saved" : "Save role"}
            className={`w-9 h-9 inline-flex items-center justify-center border rounded-[4px] transition-colors ${
              saved ? "border-brass text-brass bg-highlight" : "border-border text-muted hover:text-navy hover:border-navy/40"
            }`}>
            <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
          </button>
          <Link href={`/jobs/${job.id}`}
            className="h-9 inline-flex items-center px-5 bg-navy hover:bg-navy-mid text-white text-[13px] font-sans font-semibold uppercase tracking-[0.16em] rounded-[4px] transition-colors">
            View role
          </Link>
        </div>
      </div>
    </article>
  );
}
