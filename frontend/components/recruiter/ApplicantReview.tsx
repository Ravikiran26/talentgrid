"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, FileText, Users, Search,
  Check, X, Clock, GraduationCap, ExternalLink, AlertCircle, Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { computeMatch } from "@/lib/match";
import { formatSalary, formatExperience, formatRelativeDate, formatRelativeDateInline, formatMonthYear } from "@/lib/utils";
import type { Job } from "@/types";

/* ── Data ─────────────────────────────────────────────────────── */

export type AppStatus = "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "REJECTED";
export type ReviewStatus = Exclude<AppStatus, "APPLIED">;

interface ExperienceDto {
  id: number; title: string; company: string; location?: string | null;
  startDate?: string | null; endDate?: string | null; current: boolean; description?: string | null;
}
interface EducationDto {
  id: number; institution: string; degree?: string | null; fieldOfStudy?: string | null;
  startYear?: number | null; endYear?: number | null; grade?: string | null;
}

/** Shape returned by both /api/employer/jobs/{id}/applications and /api/admin/jobs/{id}/applications. */
export interface ApplicantDto {
  applicationId: number;
  status: AppStatus;
  appliedAt: string;
  coverLetter?: string | null;
  candidate: {
    id: number; fullName: string; email: string; phone?: string | null; headline?: string | null;
    city?: string | null; totalExp?: number | null; skills?: string[]; about?: string | null;
    resumeFile?: string | null; hasPhoto?: boolean;
    experience?: ExperienceDto[]; education?: EducationDto[];
  };
}

export interface Applicant {
  id: number;
  candidateId: number;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  totalExp: number | null;
  headline?: string;
  about?: string;
  skills: string[];
  hasResume: boolean;
  hasPhoto: boolean;
  coverLetter?: string;
  status: AppStatus;
  appliedAt: string;
  experience: ExperienceDto[];
  education: EducationDto[];
}

export function toApplicant(d: ApplicantDto): Applicant {
  const c = d.candidate;
  const startOf = (e: ExperienceDto) => (e.startDate ? new Date(e.startDate).getTime() : 0);
  return {
    id: d.applicationId,
    candidateId: c.id,
    fullName: c.fullName ?? "",
    email: c.email ?? "",
    phone: c.phone ?? undefined,
    city: c.city ?? undefined,
    totalExp: c.totalExp ?? null,
    headline: c.headline ?? undefined,
    about: c.about ?? undefined,
    skills: c.skills ?? [],
    hasResume: !!c.resumeFile,
    hasPhoto: !!c.hasPhoto,
    coverLetter: d.coverLetter ?? undefined,
    status: d.status,
    appliedAt: d.appliedAt,
    // Current role first, then most recent.
    experience: [...(c.experience ?? [])].sort((a, b) => Number(b.current) - Number(a.current) || startOf(b) - startOf(a)),
    education: [...(c.education ?? [])].sort((a, b) => (b.endYear ?? 0) - (a.endYear ?? 0)),
  };
}

/* ── Display helpers ──────────────────────────────────────────── */

const STATUS: Record<AppStatus, { label: string; cls: string; dot: string }> = {
  APPLIED:      { label: "New",          cls: "bg-blue-50 text-blue-700 border-blue-200",    dot: "bg-blue-500" },
  UNDER_REVIEW: { label: "Reviewing",    cls: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500" },
  SHORTLISTED:  { label: "Shortlisted",  cls: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-600" },
  REJECTED:     { label: "Not selected", cls: "bg-red-50 text-red-600 border-red-200",       dot: "bg-red-400" },
};

const FILTERS = ["all", "APPLIED", "UNDER_REVIEW", "SHORTLISTED", "REJECTED"] as const;
type Filter = (typeof FILTERS)[number];

const ACTIONS: { status: ReviewStatus; label: string; icon: typeof Check; cls: string; activeCls: string }[] = [
  { status: "UNDER_REVIEW", label: "Reviewing", icon: Clock, cls: "border-amber-300 text-amber-800 hover:bg-amber-50", activeCls: "bg-amber-50 border-amber-400 text-amber-800" },
  { status: "SHORTLISTED",  label: "Shortlist", icon: Check, cls: "border-green-300 text-green-700 hover:bg-green-50", activeCls: "bg-green-600 border-green-600 text-white" },
  { status: "REJECTED",     label: "Reject",    icon: X,     cls: "border-red-200 text-red-600 hover:bg-red-50",       activeCls: "bg-red-50 border-red-300 text-red-600" },
];

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function years(n: number | null) {
  return n == null ? null : `${n} ${n === 1 ? "yr" : "yrs"}`;
}

/** "2 yrs 3 mos" between two dates (end defaults to today). */
function tenure(start?: string | null, end?: string | null) {
  if (!start) return "";
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
  if (months <= 0) return "";
  const y = Math.floor(months / 12), m = months % 12;
  return [y && `${y} ${y === 1 ? "yr" : "yrs"}`, m && `${m} ${m === 1 ? "mo" : "mos"}`].filter(Boolean).join(" ");
}

/** Loads an authenticated file (photo, resume) as an object URL; null until loaded or when path is null. */
function useBlob(path: string | null) {
  const [state, setState] = useState<{ path: string; url: string; type: string } | null>(null);
  useEffect(() => {
    if (!path) return;
    let url: string | null = null;
    let cancelled = false;
    api.downloadBlob(path)
      .then((b) => {
        if (cancelled) return;
        url = URL.createObjectURL(b);
        setState({ path, url, type: b.type });
      })
      .catch(() => { /* caller falls back */ });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [path]);
  return state && state.path === path ? state : null;
}

/* ── Component ────────────────────────────────────────────────── */

interface Props {
  job: Job;
  applicants: Applicant[];
  backHref: string;
  backLabel: string;
  photoPath: (a: Applicant) => string;
  resumePath: (a: Applicant) => string;
  onStatusChange: (applicationId: number, status: ReviewStatus) => Promise<void>;
}

const label = "text-[11.5px] font-sans font-semibold uppercase tracking-[0.2em] text-muted";

export default function ApplicantReview({ job, applicants, backHref, backLabel, photoPath, resumePath, onStatusChange }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  // null = nothing chosen yet: desktop shows the first applicant, mobile shows the list.
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const counts: Record<Filter, number> = {
    all: applicants.length,
    APPLIED: 0, UNDER_REVIEW: 0, SHORTLISTED: 0, REJECTED: 0,
  };
  applicants.forEach((a) => { counts[a.status] += 1; });

  const kw = search.trim().toLowerCase();
  const shown = applicants
    .filter((a) => filter === "all" || a.status === filter)
    .filter((a) => !kw
      || a.fullName.toLowerCase().includes(kw)
      || (a.headline ?? "").toLowerCase().includes(kw)
      || (a.city ?? "").toLowerCase().includes(kw)
      || a.skills.some((s) => s.toLowerCase().includes(kw))
      || a.experience.some((e) => e.company.toLowerCase().includes(kw)));

  const active = shown.find((a) => a.id === selectedId) ?? shown[0] ?? null;

  return (
    <div className="bg-ivory min-h-screen">
      {/* Job header */}
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1320px] mx-auto px-5 lg:px-8 py-6">
          <Link href={backHref} className="inline-flex items-center gap-2 text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-navy-text hover:text-brass transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> {backLabel}
          </Link>
          <div className="mt-4 flex flex-col md:flex-row md:items-end gap-4 justify-between">
            <div className="min-w-0">
              <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.24em] text-brass">Applicants</p>
              <h1 className="mt-1 font-serif text-[1.9rem] font-bold text-surface leading-tight">{job.title}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[14px] font-sans text-navy-text-light">
                <span>{job.company}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-brass" />{job.location}</span>
                <span className="inline-flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-brass" />{formatExperience(job.experienceMin, job.experienceMax)}</span>
                <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
              </p>
            </div>
            <dl className="flex gap-6 text-navy-text">
              {([["Total", counts.all], ["New", counts.APPLIED], ["Shortlisted", counts.SHORTLISTED]] as const).map(([k, v]) => (
                <div key={k}>
                  <dd className="font-serif text-[1.9rem] font-bold text-surface leading-none tabular-nums">{v}</dd>
                  <dt className="mt-1 text-[12px] font-sans uppercase tracking-[0.16em]">{k}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-5 lg:px-8 py-6">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between mb-5">
          <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 pb-1 lg:pb-0">
            {FILTERS.map((f) => (
              <button key={f} type="button" onClick={() => { setFilter(f); setSelectedId(null); }}
                className={`whitespace-nowrap text-[12.5px] font-sans font-semibold uppercase tracking-[0.12em] px-3.5 py-2 border rounded-[4px] transition-colors ${
                  filter === f ? "bg-navy border-navy text-surface" : "bg-white border-border text-muted hover:border-navy/40 hover:text-charcoal"}`}>
                {f === "all" ? "All" : STATUS[f].label} <span className="tabular-nums opacity-70">({counts[f]})</span>
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setSelectedId(null); }}
              placeholder="Search name, skill, company, city…"
              aria-label="Search applicants"
              className="w-full pl-10 pr-3 py-2.5 text-[14px] font-sans text-charcoal placeholder:text-muted-light bg-white border border-border rounded-[4px] focus:outline-none focus:border-navy transition-colors" />
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="py-20 text-center bg-white border border-border rounded-[8px]">
            <Users className="w-8 h-8 text-muted mx-auto mb-3" />
            <p className="text-[15px] font-sans text-muted">
              {counts.all === 0 ? "No applications yet for this role." : "No applicants match this view."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-5 items-start">
            {/* Applicant list */}
            <ul aria-label="Applicants"
              className={`bg-white border border-border rounded-[8px] divide-y divide-border overflow-hidden lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto ${
                selectedId != null ? "hidden lg:block" : ""}`}>
              {shown.map((a) => (
                <li key={a.id}>
                  <ApplicantRow a={a} job={job} photoPath={photoPath(a)} selected={active?.id === a.id}
                    onSelect={() => setSelectedId(a.id)} />
                </li>
              ))}
            </ul>

            {/* Profile */}
            {active && (
              <div className={selectedId == null ? "hidden lg:block" : ""}>
                <button type="button" onClick={() => setSelectedId(null)}
                  className="lg:hidden mb-3 inline-flex items-center gap-2 text-[12.5px] font-sans font-semibold uppercase tracking-[0.16em] text-navy">
                  <ArrowLeft className="w-3.5 h-3.5" /> All applicants
                </button>
                <ApplicantProfile key={active.id} a={active} job={job}
                  photoPath={photoPath(active)} resumePath={resumePath(active)} onStatusChange={onStatusChange} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── List row ─────────────────────────────────────────────────── */

function Avatar({ a, path, size }: { a: Applicant; path: string; size: "sm" | "lg" }) {
  const photo = useBlob(a.hasPhoto ? path : null);
  const dims = size === "lg" ? "w-16 h-16 text-[20px]" : "w-11 h-11 text-[14px]";
  return photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo.url} alt="" className={`${dims} rounded-full object-cover flex-shrink-0`} />
  ) : (
    <span className={`${dims} rounded-full bg-navy text-brass font-sans font-bold flex items-center justify-center flex-shrink-0`}>
      {initials(a.fullName)}
    </span>
  );
}

function ApplicantRow({ a, job, photoPath, selected, onSelect }: {
  a: Applicant; job: Job; photoPath: string; selected: boolean; onSelect: () => void;
}) {
  const match = computeMatch(job, a.skills, a.totalExp);
  const current = a.experience.find((e) => e.current) ?? a.experience[0];
  const st = STATUS[a.status];
  return (
    <button type="button" onClick={onSelect} aria-current={selected}
      className={`w-full text-left flex gap-3 px-4 py-3.5 transition-colors border-l-[3px] ${
        selected ? "bg-highlight border-l-brass" : "border-l-transparent hover:bg-ivory"}`}>
      <Avatar a={a} path={photoPath} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="text-[15px] font-sans font-semibold text-navy truncate">{a.fullName}</span>
          <span className="text-[12.5px] font-sans font-bold text-brass tabular-nums whitespace-nowrap">{match.percent}%</span>
        </span>
        <span className="block text-[13px] font-sans text-charcoal truncate">
          {current ? `${current.title} · ${current.company}` : a.headline}
        </span>
        <span className="mt-1 flex items-center gap-2 text-[12.5px] font-sans text-muted">
          <span className="inline-flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}</span>
          <span className="text-border">·</span>
          <span className="truncate">{[years(a.totalExp), a.city].filter(Boolean).join(" · ")}</span>
          <span className="ml-auto whitespace-nowrap">{formatRelativeDate(a.appliedAt)}</span>
        </span>
      </span>
    </button>
  );
}

/* ── Profile pane ─────────────────────────────────────────────── */

function ApplicantProfile({ a, job, photoPath, resumePath, onStatusChange }: {
  a: Applicant; job: Job; photoPath: string; resumePath: string;
  onStatusChange: (applicationId: number, status: ReviewStatus) => Promise<void>;
}) {
  const [busy, setBusy] = useState<ReviewStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const resume = useBlob(a.hasResume ? resumePath : null);
  const match = computeMatch(job, a.skills, a.totalExp);
  const matchedSet = new Set(match.matched.map((s) => s.toLowerCase()));
  const missing = job.skills.filter((s) => !matchedSet.has(s.toLowerCase()));
  const otherSkills = a.skills.filter((s) => !matchedSet.has(s.toLowerCase()));
  const st = STATUS[a.status];

  async function move(status: ReviewStatus) {
    setBusy(status);
    setError(null);
    try {
      await onStatusChange(a.id, status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update this applicant.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="bg-white border border-border rounded-[8px]" aria-label={`${a.fullName}'s application`}>
      {/* Identity + actions */}
      <header className="p-6 border-b border-border">
        <div className="flex items-start gap-4">
          <Avatar a={a} path={photoPath} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-serif text-[1.6rem] font-bold text-navy leading-tight">{a.fullName}</h2>
                {a.headline && <p className="mt-0.5 text-[15px] font-sans text-charcoal">{a.headline}</p>}
              </div>
              <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-sans font-semibold px-2.5 py-1 border rounded-[4px] ${st.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
              </span>
            </div>
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[14px] font-sans text-muted">
              {a.totalExp != null && <span className="inline-flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{years(a.totalExp)} experience</span>}
              {a.city && <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" />{a.city}</span>}
              <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1.5 hover:text-navy"><Mail className="w-4 h-4" />{a.email}</a>
              {a.phone && <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-navy"><Phone className="w-4 h-4" />{a.phone}</a>}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {ACTIONS.map(({ status, label: text, icon: Icon, cls, activeCls }) => {
            const current = a.status === status;
            return (
              <button key={status} type="button" disabled={current || busy != null} onClick={() => move(status)}
                className={`inline-flex items-center gap-1.5 h-9 px-4 text-[12.5px] font-sans font-semibold uppercase tracking-[0.14em] border rounded-[4px] transition-colors disabled:cursor-default ${
                  current ? activeCls : `${cls} disabled:opacity-50`}`}>
                {busy === status ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
                {current ? STATUS[status].label : text}
              </button>
            );
          })}
          {resume && (
            <a href={resume.url} target="_blank" rel="noopener"
              className="ml-auto inline-flex items-center gap-1.5 h-9 px-4 text-[12.5px] font-sans font-semibold uppercase tracking-[0.14em] text-white bg-navy hover:bg-navy-mid rounded-[4px] transition-colors">
              <FileText className="w-3.5 h-3.5" /> Open resume
            </a>
          )}
        </div>
        {error && (
          <p className="mt-3 flex items-center gap-2 text-[13.5px] font-sans text-red-600">
            <AlertCircle className="w-4 h-4" />{error}
          </p>
        )}
        <p className="mt-3 text-[13px] font-sans text-muted">Applied {formatRelativeDateInline(a.appliedAt)}</p>
      </header>

      {/* Fit for this role */}
      <section className="p-6 border-b border-border">
        <div className="flex items-baseline justify-between gap-3">
          <p className={label}>Fit for this role</p>
          <p className="text-[14px] font-sans text-muted">
            <span className="font-serif text-[1.5rem] font-bold text-navy">{match.percent}%</span> match
          </p>
        </div>
        <div className="mt-2 h-[6px] bg-track rounded-full overflow-hidden">
          <div className="h-full bg-brass rounded-full" style={{ width: `${match.percent}%` }} />
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[13px] font-sans font-semibold text-charcoal">Has {match.matched.length} of {job.skills.length} required skills</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {match.matched.map((s) => (
                <li key={s} className="inline-flex items-center gap-1 text-[13px] font-sans text-green-800 bg-green-50 border border-green-200 rounded-[3px] px-2 py-0.5">
                  <Check className="w-3 h-3" strokeWidth={2.5} />{s}
                </li>
              ))}
            </ul>
          </div>
          {missing.length > 0 && (
            <div>
              <p className="text-[13px] font-sans font-semibold text-charcoal">Not on profile</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {missing.map((s) => (
                  <li key={s} className="text-[13px] font-sans text-muted border border-border rounded-[3px] px-2 py-0.5">{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="mt-3 text-[13px] font-sans text-muted">
          Role asks for {formatExperience(job.experienceMin, job.experienceMax)}
          {a.totalExp != null && <>; candidate has {years(a.totalExp)}</>}.
        </p>
      </section>

      {a.coverLetter && (
        <section className="p-6 border-b border-border">
          <p className={label}>Cover note</p>
          <p className="mt-2 text-[15px] font-sans text-charcoal leading-relaxed border-l-2 border-brass pl-4 whitespace-pre-line">{a.coverLetter}</p>
        </section>
      )}

      {a.about && (
        <section className="p-6 border-b border-border">
          <p className={label}>Profile summary</p>
          <p className="mt-2 text-[15px] font-sans text-charcoal leading-relaxed whitespace-pre-line">{a.about}</p>
        </section>
      )}

      {a.experience.length > 0 && (
        <section className="p-6 border-b border-border">
          <p className={label}>Work experience</p>
          <ol className="mt-4 space-y-5">
            {a.experience.map((e) => (
              <li key={e.id} className="relative pl-6 border-l-2 border-border">
                <span className={`absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full ${e.current ? "bg-brass" : "bg-border"}`} />
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="text-[15.5px] font-sans font-semibold text-navy">{e.title}</p>
                  <p className="text-[13px] font-sans text-muted whitespace-nowrap">
                    {formatMonthYear(e.startDate)} – {e.current ? "Present" : formatMonthYear(e.endDate)}
                    {tenure(e.startDate, e.current ? null : e.endDate) && <> · {tenure(e.startDate, e.current ? null : e.endDate)}</>}
                  </p>
                </div>
                <p className="text-[14px] font-sans text-charcoal">{[e.company, e.location].filter(Boolean).join(" · ")}</p>
                {e.description && <p className="mt-1.5 text-[14px] font-sans text-muted leading-relaxed whitespace-pre-line">{e.description}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {a.education.length > 0 && (
        <section className="p-6 border-b border-border">
          <p className={label}>Education</p>
          <ul className="mt-4 space-y-4">
            {a.education.map((ed) => (
              <li key={ed.id} className="flex gap-3">
                <GraduationCap className="w-5 h-5 text-brass flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[15px] font-sans font-semibold text-navy">
                    {[ed.degree, ed.fieldOfStudy].filter(Boolean).join(" – ") || ed.institution}
                  </p>
                  <p className="text-[14px] font-sans text-charcoal">{ed.institution}</p>
                  <p className="text-[13px] font-sans text-muted">
                    {[ed.startYear && ed.endYear ? `${ed.startYear} – ${ed.endYear}` : ed.endYear, ed.grade].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {otherSkills.length > 0 && (
        <section className="p-6 border-b border-border">
          <p className={label}>Other skills</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {otherSkills.map((s) => (
              <li key={s} className="text-[13px] font-sans text-charcoal border border-border rounded-[3px] px-2 py-0.5">{s}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Resume */}
      <section className="p-6">
        <div className="flex items-center justify-between gap-3">
          <p className={label}>Resume</p>
          {resume && (
            <a href={resume.url} target="_blank" rel="noopener"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-sans font-semibold uppercase tracking-[0.14em] text-navy hover:text-brass">
              Open in new tab <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        {!a.hasResume ? (
          <p className="mt-3 text-[14px] font-sans text-muted">No resume uploaded.</p>
        ) : !resume ? (
          <div className="mt-3 h-[200px] bg-ivory border border-border rounded-[4px] animate-pulse" aria-busy="true" />
        ) : resume.type === "application/pdf" ? (
          previewOpen ? (
            <>
              <iframe src={resume.url} title={`${a.fullName} resume`}
                className="mt-3 w-full h-[760px] border border-border rounded-[4px] bg-ivory" />
              <button type="button" onClick={() => setPreviewOpen(false)}
                className="mt-2 text-[12.5px] font-sans font-semibold uppercase tracking-[0.14em] text-muted hover:text-navy">
                Hide preview
              </button>
            </>
          ) : (
            // Loaded on demand so clicking through applicants doesn't render a PDF each time.
            <button type="button" onClick={() => setPreviewOpen(true)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-8 border border-dashed border-border rounded-[4px] bg-ivory text-[13px] font-sans font-semibold uppercase tracking-[0.14em] text-navy hover:border-navy/40 transition-colors">
              <FileText className="w-4 h-4" /> Preview resume
            </button>
          )
        ) : (
          <p className="mt-3 text-[14px] font-sans text-muted">This resume format can&apos;t be previewed. Use “Open in new tab” to download it.</p>
        )}
      </section>
    </article>
  );
}
