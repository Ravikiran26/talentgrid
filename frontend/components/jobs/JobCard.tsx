import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Job } from "@/types";
import { formatSalary, formatExperience } from "@/lib/utils";

interface Props { job: Job; featured?: boolean; applied?: boolean; }

export default function JobCard({ job, featured = false, applied = false }: Props) {

  /* ── Featured card (used in hero) ── */
  if (featured) {
    return (
      <article className="relative">
        <div className="w-8 h-[2px] bg-brass mb-7" />

        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-navy-border flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-sans font-bold text-brass tracking-widest">
              {job.companyLogoInitials}
            </span>
          </div>
          <div>
            <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.24em] text-brass leading-none mb-1">
              Featured Opportunity
            </p>
            <p className="text-[12px] font-sans text-[#5A7A9A]">{job.company}</p>
          </div>
        </div>

        <h3 className="font-serif text-3xl font-semibold text-surface leading-tight tracking-tight">
          {job.title}
        </h3>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-sans text-[#7A95B0]">
          <span className="capitalize">{job.category}</span>
          <span className="text-navy-border">·</span>
          <span>{job.location}</span>
          <span className="text-navy-border">·</span>
          <span>{job.employmentType}</span>
        </div>

        <div className="mt-6 w-full h-px bg-navy-border/50" />

        <p className="mt-6 text-[14px] font-sans text-[#7A95B0] leading-relaxed max-w-lg">
          {job.description
            ? job.description.slice(0, 180) + "…"
            : `A senior-level position with broad scope at ${job.company}.`}
        </p>

        <div className="mt-5 text-[13px] font-sans text-[#7A95B0]">
          {formatExperience(job.experienceMin, job.experienceMax)}
          {job.salaryMin && (
            <>
              <span className="mx-2.5 text-navy-border">·</span>
              {formatSalary(job.salaryMin, job.salaryMax)}
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {job.skills.slice(0, 4).map((s) => (
            <span key={s}
              className="text-[10px] font-sans font-medium text-[#8AA0BA] border border-navy-border px-3 py-1 tracking-wide">
              {s}
            </span>
          ))}
        </div>

        <Link
          href={`/jobs/${job.id}`}
          className="mt-9 inline-flex items-center gap-3 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-surface border border-navy-border hover:border-brass hover:text-brass px-7 py-3.5 transition-all duration-200 group"
        >
          View Opportunity
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </article>
    );
  }

  /* ── Standard row — warm light listing ── */
  return (
    <article className="group relative border-b border-border last:border-b-0 transition-all duration-200 hover:bg-[#FDFAF6]">
      {/* Brass left accent bar slides in on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brass scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-200" />

      <div className="px-6 py-5 group-hover:pl-9 transition-all duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">

          {/* Left: badge + info */}
          <div className="sm:col-span-10 flex items-start gap-4">

            {/* Company initials badge */}
            <div className="w-10 h-10 bg-ivory border border-border flex items-center justify-center flex-shrink-0 group-hover:border-brass/40 group-hover:bg-surface transition-colors duration-200">
              <span className="text-[10px] font-sans font-bold text-muted group-hover:text-brass tracking-wider transition-colors duration-200">
                {job.companyLogoInitials}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.22em] text-brass mb-1.5">
                {job.category}
              </p>
              <Link
                href={`/jobs/${job.id}`}
                className="font-serif text-[1.15rem] font-semibold text-charcoal group-hover:text-navy transition-colors duration-150 leading-snug"
              >
                {job.title}
              </Link>
              <p className="mt-1 text-[12px] font-sans text-muted">
                {job.company}
                <span className="mx-2 text-border">·</span>
                {job.location}
              </p>
              <p className="mt-0.5 text-[12px] font-sans text-muted">
                {formatExperience(job.experienceMin, job.experienceMax)}
                {job.salaryMin && (
                  <>
                    <span className="mx-2 text-border">·</span>
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </>
                )}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {job.skills.slice(0, 4).map((s) => (
                  <span key={s}
                    className="text-[10px] font-sans text-muted border border-border px-2.5 py-0.5 group-hover:border-navy/20 group-hover:text-charcoal transition-colors duration-200">
                    {s}
                  </span>
                ))}
                {job.skills.length > 4 && (
                  <span className="text-[10px] font-sans text-muted/60 px-1 py-0.5">
                    +{job.skills.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: date + CTA */}
          <div className="sm:col-span-2 flex sm:flex-col sm:items-end items-center justify-between gap-2">
            <div className="flex flex-col sm:items-end gap-1.5">
              <span className="text-[10px] font-sans text-muted">{job.postedAt}</span>
              {applied ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Applied
                </span>
              ) : (
                <span className="text-[10px] font-sans text-muted border border-border px-2 py-0.5 group-hover:border-navy/20 transition-colors duration-200">
                  {job.employmentType}
                </span>
              )}
            </div>
            <Link
              href={`/jobs/${job.id}`}
              className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-navy group-hover:text-brass transition-colors duration-150 whitespace-nowrap"
              aria-label={`View ${job.title}`}
            >
              {applied ? "View →" : "View Role →"}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
