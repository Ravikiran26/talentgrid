import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import { formatSalary, formatExperience } from "@/lib/utils";
import type { Job } from "@/types";

interface Props { jobs: Job[] }

/**
 * Three live roles from the jobs API. No match percentage here — the visitor is
 * not signed in, so there is no profile to match against.
 */
export default function FeaturedOpportunities({ jobs }: Props) {
  if (jobs.length === 0) return null;

  return (
    <section className="bg-ivory border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
          <div>
            <h2 className="font-serif text-[2.1rem] font-bold text-navy leading-tight tracking-tight">
              Selected opportunities
            </h2>
            <p className="mt-3 text-[16px] font-sans text-muted max-w-xl">
              Roles curated for experienced Project Management professionals.
            </p>
          </div>
          <Link href="/jobs"
            className="self-start text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-navy border-b-2 border-brass pb-1.5 hover:text-brass transition-colors whitespace-nowrap">
            All opportunities →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {jobs.slice(0, 3).map((job) => (
            <article key={job.id}
              className="group bg-surface border border-border p-7 flex flex-col hover:border-brass/60 transition-colors duration-200">
              <p className="text-[10.5px] font-sans font-semibold uppercase tracking-[0.22em] text-brass">
                {job.category}
              </p>
              <h3 className="mt-3 font-serif text-[1.35rem] font-bold text-navy leading-snug">
                <Link href={`/jobs/${job.id}`} className="hover:text-brass transition-colors">
                  {job.title}
                </Link>
              </h3>
              <p className="mt-1.5 text-[14.5px] font-sans text-charcoal">{job.company}</p>

              <div className="mt-5 space-y-2.5 text-[14px] font-sans text-muted">
                <p className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-muted-light" />
                  {job.location} · {job.employmentType}
                </p>
                <p className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 flex-shrink-0 text-muted-light" />
                  {formatExperience(job.experienceMin, job.experienceMax)}
                </p>
                {job.salaryMin != null && (
                  <p className="pl-[26px] font-medium text-navy">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                )}
              </div>

              <div className="mt-auto pt-6 flex items-center justify-between border-t border-border mt-6">
                <span className="text-[12.5px] font-sans text-muted">{job.postedAt}</span>
                <Link href={`/jobs/${job.id}`}
                  className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.16em] text-navy group-hover:text-brass transition-colors">
                  View opportunity →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
