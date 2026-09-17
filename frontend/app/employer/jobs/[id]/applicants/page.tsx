"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, FileText, Users,
  CheckCircle2, Clock, XCircle, AlertCircle, Search,
} from "lucide-react";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatSalary, formatExperience, formatRelativeDate } from "@/lib/utils";
import { normalizeJob } from "@/lib/jobs";
import type { Job } from "@/types";

type Status = "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "REJECTED";

interface ApplicantDto {
  applicationId: number;
  status: Status;
  appliedAt: string;
  coverLetter?: string | null;
  candidate: {
    id: number; fullName: string; email: string; phone?: string | null; headline?: string | null;
    city?: string | null; totalExp?: number | null; skills?: string[]; about?: string | null;
    resumeFile?: string | null; hasPhoto?: boolean; profileStrength?: number;
  };
}

interface Applicant {
  id: number; candidateId: number; fullName: string; email: string; phone?: string;
  city?: string; totalExp?: string; headline?: string; about?: string; skills: string[];
  hasResume: boolean; hasPhoto: boolean; profileStrength: number;
  coverLetter?: string; status: Status; appliedAt: string;
}

function flatten(d: ApplicantDto): Applicant {
  const c = d.candidate;
  return {
    id: d.applicationId,
    candidateId: c.id,
    fullName: c.fullName ?? "",
    email: c.email ?? "",
    phone: c.phone ?? undefined,
    city: c.city ?? undefined,
    totalExp: c.totalExp != null ? `${c.totalExp} ${c.totalExp === 1 ? "year" : "years"}` : undefined,
    headline: c.headline ?? undefined,
    about: c.about ?? undefined,
    skills: c.skills ?? [],
    hasResume: !!c.resumeFile,
    hasPhoto: !!c.hasPhoto,
    profileStrength: c.profileStrength ?? 0,
    coverLetter: d.coverLetter ?? undefined,
    status: d.status,
    appliedAt: d.appliedAt,
  };
}

const STATUS = {
  APPLIED:      { label: "Applied",      cls: "bg-blue-50 text-blue-700 border-blue-200",    dot: "bg-blue-400",  icon: Clock },
  UNDER_REVIEW: { label: "Under Review", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", icon: Clock },
  SHORTLISTED: { label: "Shortlisted",  cls: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500", icon: CheckCircle2 },
  REJECTED:    { label: "Not Selected", cls: "bg-red-50 text-red-600 border-red-200",       dot: "bg-red-400",   icon: XCircle },
} as const;

const FILTERS = ["all", "APPLIED", "UNDER_REVIEW", "SHORTLISTED", "REJECTED"] as const;
type Filter = (typeof FILTERS)[number];

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function JobApplicantsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [rows, setRows] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [j, a] = await Promise.all([
        api.get<Record<string, unknown>>(`/api/employer/jobs/${id}`),
        api.get<ApplicantDto[]>(`/api/employer/jobs/${id}/applications?size=100`),
      ]);
      setJob(normalizeJob(j));
      setRows(a.map(flatten));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load applicants.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "EMPLOYER") { router.push("/"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [router, load]);

  async function setStatus(appId: number, status: "UNDER_REVIEW" | "SHORTLISTED" | "REJECTED") {
    setBusy(appId);
    try {
      await api.patch(`/api/employer/applications/${appId}/status`, { status });
      setRows((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update this applicant.");
    } finally { setBusy(null); }
  }

  const counts = {
    all: rows.length,
    APPLIED: rows.filter((a) => a.status === "APPLIED").length,
    UNDER_REVIEW: rows.filter((a) => a.status === "UNDER_REVIEW").length,
    SHORTLISTED: rows.filter((a) => a.status === "SHORTLISTED").length,
    REJECTED: rows.filter((a) => a.status === "REJECTED").length,
  };
  const kw = search.trim().toLowerCase();
  const shown = rows.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (!kw) return true;
    return a.fullName.toLowerCase().includes(kw)
      || (a.headline ?? "").toLowerCase().includes(kw)
      || (a.city ?? "").toLowerCase().includes(kw)
      || a.skills.some((s) => s.toLowerCase().includes(kw));
  });

  if (loading) return <div className="min-h-screen bg-ivory" aria-busy="true" />;

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8">
          <Link href="/employer/dashboard" className="inline-flex items-center gap-2 text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-navy-text hover:text-brass transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> My job listings
          </Link>
          <div className="mt-5 flex flex-col md:flex-row md:items-end gap-4 justify-between">
            <div>
              <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.24em] text-brass">Applicants</p>
              <h1 className="mt-1 font-serif text-3xl font-bold text-surface leading-tight">{job?.title ?? "Role"}</h1>
              {job && (
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-sans text-navy-text-light">
                  <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-brass" />{job.location}</span>
                  <span className="inline-flex items-center gap-2"><Briefcase className="w-4 h-4 text-brass" />{formatExperience(job.experienceMin, job.experienceMax)}</span>
                  <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>
              )}
            </div>
            <p className="text-[15px] font-sans text-navy-text">
              <span className="font-serif text-3xl font-bold text-surface">{counts.all}</span>{" "}
              {counts.all === 1 ? "applicant" : "applicants"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8">
        {error && (
          <p className="mb-5 flex items-center gap-2 text-[14px] font-sans text-red-600 bg-red-50 border border-red-200 px-4 py-3">
            <AlertCircle className="w-4 h-4" />{error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-6 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)}
                className={`text-[12px] font-sans font-semibold uppercase tracking-[0.16em] px-4 py-2 border transition-colors ${
                  filter === f ? "bg-navy border-navy text-surface" : "border-border text-muted hover:border-navy/40 hover:text-charcoal"}`}>
                {f === "all" ? `All (${counts.all})` : `${STATUS[f].label} (${counts[f]})`}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, headline, skill…"
              className="w-full pl-11 pr-4 py-2.5 text-[14px] font-sans text-charcoal placeholder-muted bg-surface border border-border focus:outline-none focus:border-navy transition-colors" />
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="py-20 text-center bg-surface border border-border">
            <Users className="w-8 h-8 text-muted mx-auto mb-3" />
            <p className="text-[15px] font-sans text-muted">
              {counts.all === 0 ? "No applications yet for this role." : "No applicants match this view."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {shown.map((a) => (
              <ApplicantCard key={a.id} a={a} busy={busy === a.id} onStatus={setStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicantCard({ a, busy, onStatus }: {
  a: Applicant; busy: boolean;
  onStatus: (id: number, status: "UNDER_REVIEW" | "SHORTLISTED" | "REJECTED") => void;
}) {
  const st = STATUS[a.status];
  const [photo, setPhoto] = useState<string | null>(null);
  const [resumeBusy, setResumeBusy] = useState(false);

  useEffect(() => {
    if (!a.hasPhoto) return;
    let url: string | null = null;
    let cancelled = false;
    api.downloadBlob(`/api/employer/applications/${a.id}/photo`)
      .then((b) => { if (cancelled) return; url = URL.createObjectURL(b); setPhoto(url); })
      .catch(() => {/* initials */});
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [a.id, a.hasPhoto]);

  async function openResume() {
    setResumeBusy(true);
    try {
      const blob = await api.downloadBlob(`/api/employer/applications/${a.id}/resume`);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {/* ignore */} finally { setResumeBusy(false); }
  }

  return (
    <article className="bg-surface border border-border p-6 flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center flex-shrink-0 overflow-hidden">
            {photo
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={photo} alt="" className="w-full h-full object-cover" />
              : <span className="text-[15px] font-sans font-bold text-brass">{initials(a.fullName)}</span>}
          </div>
          <div className="min-w-0">
            <p className="font-serif text-xl font-bold text-navy leading-tight">{a.fullName}</p>
            {a.headline && <p className="text-[14px] font-sans text-muted mt-0.5">{a.headline}</p>}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-[12px] font-sans font-semibold px-2.5 py-1 border flex-shrink-0 ${st.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] font-sans text-muted">
        <a href={`mailto:${a.email}`} className="inline-flex items-center gap-2 hover:text-navy transition-colors break-all">
          <Mail className="w-3.5 h-3.5 flex-shrink-0" />{a.email}
        </a>
        {a.phone && <span className="inline-flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{a.phone}</span>}
        {a.city && <span className="inline-flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{a.city}</span>}
        {a.totalExp && <span className="inline-flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" />{a.totalExp}</span>}
      </div>

      {a.about && <p className="mt-4 text-[14px] font-sans text-muted leading-relaxed line-clamp-3">{a.about}</p>}

      {a.coverLetter && (
        <div className="mt-4 border-l-2 border-brass pl-4">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-muted mb-1">Cover note</p>
          <p className="text-[14px] font-sans text-charcoal leading-relaxed">{a.coverLetter}</p>
        </div>
      )}

      {a.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {a.skills.slice(0, 8).map((s) => (
            <span key={s} className="text-[12px] font-sans text-muted border border-border px-2.5 py-1">{s}</span>
          ))}
          {a.skills.length > 8 && <span className="text-[12px] font-sans text-muted px-1 py-1">+{a.skills.length - 8}</span>}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="text-[12.5px] font-sans text-muted">Applied {formatRelativeDate(a.appliedAt).toLowerCase()}</span>
          {a.hasResume && (
            <button type="button" onClick={openResume} disabled={resumeBusy}
              className="inline-flex items-center gap-1.5 text-[12px] font-sans font-semibold uppercase tracking-[0.14em] text-navy hover:text-brass transition-colors disabled:opacity-50">
              <FileText className="w-3.5 h-3.5" />{resumeBusy ? "Opening…" : "Resume"}
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {a.status === "APPLIED" && (
            <button type="button" disabled={busy} onClick={() => onStatus(a.id, "UNDER_REVIEW")}
              className="text-[12px] font-sans font-semibold uppercase tracking-[0.14em] text-amber-700 border border-amber-300 px-4 py-2 hover:bg-amber-50 transition-colors disabled:opacity-50">
              Mark reviewing
            </button>
          )}
          {a.status !== "SHORTLISTED" && (
            <button type="button" disabled={busy} onClick={() => onStatus(a.id, "SHORTLISTED")}
              className="text-[12px] font-sans font-semibold uppercase tracking-[0.14em] text-green-700 border border-green-300 px-4 py-2 hover:bg-green-50 transition-colors disabled:opacity-50">
              Shortlist
            </button>
          )}
          {a.status !== "REJECTED" && (
            <button type="button" disabled={busy} onClick={() => onStatus(a.id, "REJECTED")}
              className="text-[12px] font-sans font-semibold uppercase tracking-[0.14em] text-red-600 border border-red-200 px-4 py-2 hover:bg-red-50 transition-colors disabled:opacity-50">
              Reject
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
