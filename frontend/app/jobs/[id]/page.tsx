import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { formatSalary, formatExperience } from "@/lib/utils";
import { fetchJobById, fetchJobs } from "@/lib/jobs";
import JobCard    from "@/components/jobs/JobCard";
import ApplyCard  from "@/components/jobs/ApplyCard";

export async function generateMetadata({ params }: PageProps<"/jobs/[id]">): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchJobById(id);
  if (!job) return { title: "Role Not Found" };
  return { title: `${job.title} — ${job.company}`, description: job.description };
}

export default async function JobDetailsPage({ params }: PageProps<"/jobs/[id]">) {
  const { id } = await params;
  const job    = await fetchJobById(id);
  if (!job) notFound();

  const sameCategory = await fetchJobs({ category: job.category, size: 5 });
  const similar = sameCategory.filter((j) => j.id !== job.id).slice(0, 4);

  return (
    <div className="bg-ivory min-h-screen">

      {/* ── Page header ── */}
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8">
          <Link href="/jobs"
            className="text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-navy-text hover:text-brass transition-colors">
            ← Opportunities
          </Link>

          <div className="mt-5 lg:max-w-[70%]">
            <span className="text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-brass block mb-3">
              {job.category}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-surface leading-tight">
              {job.title}
            </h1>
            <p className="mt-2 text-[17px] text-navy-text">
              {job.companyId
                ? <Link href={`/companies/${job.companyId}`} className="hover:text-brass transition-colors underline-offset-4 hover:underline">{job.company}</Link>
                : job.company}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[15px] text-navy-text">
              <span>{job.location}</span>
              <span className="text-navy-border">·</span>
              <span>{formatExperience(job.experienceMin, job.experienceMax)}</span>
              <span className="text-navy-border">·</span>
              <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
              <span className="text-navy-border">·</span>
              <span>{job.employmentType}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span key={s}
                  className="text-[13px] px-2.5 py-0.5 font-sans text-navy-text border border-navy-border">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Content column */}
          <div className="lg:col-span-8 space-y-0">
            <div className="bg-surface border border-border divide-y divide-border">
              {job.description && (
                <Sect title="About the Role">
                  <p className="text-[16px] text-muted leading-relaxed">{job.description}</p>
                </Sect>
              )}

              {(job.responsibilities?.length ?? 0) > 0 && (
                <Sect title="Key Responsibilities">
                  <ul className="space-y-3">
                    {job.responsibilities!.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-2 flex-shrink-0 w-1 h-1 rounded-full bg-brass" />
                        <span className="text-[16px] text-muted leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Sect>
              )}

              {(job.requirements?.length ?? 0) > 0 && (
                <Sect title="What We Are Looking For">
                  <ul className="space-y-3">
                    {job.requirements!.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-2 flex-shrink-0 w-1 h-1 rounded-full bg-brass" />
                        <span className="text-[16px] text-muted leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Sect>
              )}

              {job.education && (
                <Sect title="Education">
                  <p className="text-[16px] text-muted">{job.education}</p>
                </Sect>
              )}

              {job.aboutCompany && (
                <Sect title={`About ${job.company}`}>
                  <p className="text-[16px] text-muted leading-relaxed">{job.aboutCompany}</p>
                </Sect>
              )}
            </div>

            {/* Mobile apply */}
            <div className="lg:hidden mt-6">
              <ApplyCard job={job} />
            </div>
          </div>

          {/* Sticky sidebar */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24">
              <ApplyCard job={job} />
            </div>
          </div>

        </div>

        {/* Similar roles */}
        {similar.length > 0 && (
          <div className="mt-14 pt-10 border-t border-border">
            <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.22em] text-brass mb-2">
              Similar Roles
            </p>
            <h2 className="font-serif text-3xl font-bold text-navy mb-8">
              You May Also Consider
            </h2>
            <div className="bg-surface border border-border">
              {similar.map((j) => <JobCard key={j.id} job={j} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Sect({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-8 py-7">
      <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-brass mb-4">
        {title}
      </p>
      {children}
    </div>
  );
}

