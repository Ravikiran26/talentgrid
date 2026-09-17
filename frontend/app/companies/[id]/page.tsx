import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe, MapPin, Users, Briefcase } from "lucide-react";
import { fetchCompany } from "@/lib/company";
import JobCard from "@/components/jobs/JobCard";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await fetchCompany(id);
  return { title: c ? `${c.name} · Careers on TalentGrid` : "Company not found" };
}

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await fetchCompany(id);
  if (!company) notFound();

  const site = company.website && !/^https?:\/\//i.test(company.website) ? `https://${company.website}` : company.website;

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10 flex items-start gap-6">
          <div className="w-16 h-16 bg-navy-border flex items-center justify-center flex-shrink-0">
            <span className="text-[18px] font-sans font-bold text-brass tracking-widest">{company.logoInitials ?? "CO"}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-1">Hiring organisation</p>
            <h1 className="font-serif text-4xl font-bold text-surface leading-tight">{company.name}</h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[15px] font-sans text-navy-text">
              {company.industry && <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{company.industry}</span>}
              {company.city && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{company.city}</span>}
              {company.size && <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{company.size} employees</span>}
              {site && (
                <a href={site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-brass transition-colors">
                  <Globe className="w-3.5 h-3.5" />{company.website}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        <div>
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.24em] text-brass mb-3">
            Open roles · {company.openJobs}
          </p>
          {company.jobs.length === 0 ? (
            <p className="text-[15px] font-sans text-muted bg-surface border border-border p-8 text-center">
              No open roles right now. <Link href="/jobs" className="text-navy underline underline-offset-2">Browse all opportunities</Link>.
            </p>
          ) : (
            <div className="bg-surface border border-border">
              {company.jobs.map((j) => <JobCard key={j.id} job={j} />)}
            </div>
          )}
        </div>
        <aside className="bg-surface border border-border p-6">
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.24em] text-brass mb-3">About {company.name}</p>
          {company.description ? (
            company.description.split(/\n\s*\n/).map((p, i) => (
              <p key={i} className="text-[15.5px] font-sans text-charcoal leading-relaxed mb-3 last:mb-0">{p}</p>
            ))
          ) : (
            <p className="text-[15px] font-sans text-muted">This company has not added a description yet.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
