"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Download, Mail, Phone, MapPin, Briefcase, GraduationCap, FileText, Calendar,
  CheckCircle2, Clock, XCircle, AlertCircle,
} from "lucide-react";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatRelativeDate } from "@/lib/utils";

type Status = "ACTIVE" | "UNDER_REVIEW" | "REJECTED";

interface Detail {
  id: number; fullName: string; email: string; phone?: string | null; city?: string | null;
  totalExp?: number | string | null; headline?: string | null; skills?: string[]; about?: string | null;
  status: Status; appliedAt?: string; profileStrength?: number; resumeFile?: string | null;
  experience?: { title: string; company: string; location?: string; startDate?: string; endDate?: string; current: boolean; description?: string }[];
  education?: { institution: string; degree?: string; fieldOfStudy?: string; startYear?: number | string; endYear?: number | string; grade?: string }[];
}

const STATUS = {
  ACTIVE:       { label: "Active",       cls: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500", icon: CheckCircle2 },
  UNDER_REVIEW: { label: "Under Review", cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500", icon: Clock },
  REJECTED:     { label: "Rejected",     cls: "bg-red-100 text-red-700 border-red-200",       dot: "bg-red-400",   icon: XCircle },
} as const;

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function AdminCandidatePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [c, setC] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setC(await api.get<Detail>(`/api/admin/candidates/${id}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load candidate.");
    }
  }, [id]);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "ADMIN") { router.push("/"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    api.downloadBlob(`/api/admin/candidates/${id}/photo`)
      .then((b) => setPhoto(URL.createObjectURL(b)))
      .catch(() => {/* no photo */});
  }, [router, load, id]);

  async function setStatus(status: Status) {
    setBusy(status);
    try {
      const updated = await api.patch<Detail>(`/api/admin/candidates/${id}/status`, { status });
      setC((prev) => (prev ? { ...prev, status: updated.status } : updated));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update status.");
    } finally { setBusy(null); }
  }

  async function openResume() {
    setBusy("resume"); setResumeError(null);
    try {
      const blob = await api.downloadBlob(`/api/admin/candidates/${id}/resume`);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setResumeError(e instanceof Error ? e.message : "Failed to open resume.");
    } finally { setBusy(null); }
  }

  if (error && !c) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center px-6">
        <div className="bg-surface border border-border p-8 max-w-md text-center">
          <p className="text-[15px] font-sans text-red-600 mb-4">{error}</p>
          <Link href="/admin" className="text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass">← Back to candidates</Link>
        </div>
      </div>
    );
  }
  if (!c) return <div className="min-h-screen bg-ivory" aria-busy="true" />;

  const st = STATUS[c.status];
  const exp = c.totalExp != null && c.totalExp !== "" ? `${c.totalExp} ${Number(c.totalExp) === 1 ? "year" : "years"}` : null;
  const skills = c.skills ?? [];
  const experience = c.experience ?? [];
  const education = c.education ?? [];

  return (
    <div className="bg-ivory min-h-screen">
      {/* Header */}
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-navy-text hover:text-brass transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Candidates
          </Link>
          <div className="mt-5 flex flex-col md:flex-row md:items-center gap-5 justify-between">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-navy-mid border-2 border-navy-border overflow-hidden flex items-center justify-center flex-shrink-0">
                {photo
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={photo} alt={c.fullName} className="w-full h-full object-cover" />
                  : <span className="font-serif text-2xl font-bold text-brass">{initials(c.fullName)}</span>}
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-surface leading-tight">{c.fullName}</h1>
                {c.headline && <p className="text-[15px] font-sans text-navy-text mt-1">{c.headline}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-sans text-navy-text-light">
                  {c.city && (
                    <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-brass" />{c.city}</span>
                  )}
                  {exp && (
                    <span className="inline-flex items-center gap-2"><Briefcase className="w-4 h-4 text-brass" />{exp} experience</span>
                  )}
                  {c.appliedAt && (
                    <span className="inline-flex items-center gap-2"><Calendar className="w-4 h-4 text-brass" />Registered {formatRelativeDate(c.appliedAt).toLowerCase()}</span>
                  )}
                </div>
              </div>
            </div>
            <span className={`self-start md:self-center inline-flex items-center gap-2 text-[13px] font-sans font-semibold px-3.5 py-2 border ${st.cls}`}>
              <span className={`w-2 h-2 rounded-full ${st.dot}`} />{st.label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
        {/* Main column */}
        <div className="space-y-6">
          {error && (
            <p className="flex items-center gap-2 text-[14px] font-sans text-red-600 bg-red-50 border border-red-200 px-4 py-3">
              <AlertCircle className="w-4 h-4" />{error}
            </p>
          )}

          {c.about && (
            <Section title="About">
              <p className="text-[15px] font-sans text-charcoal leading-relaxed max-w-3xl">{c.about}</p>
            </Section>
          )}

          {skills.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => <span key={s} className="text-[13px] font-sans bg-navy text-surface px-3 py-1.5">{s}</span>)}
              </div>
            </Section>
          )}

          {experience.length > 0 && (
            <Section title="Work Experience" icon={<Briefcase className="w-4 h-4" />}>
              <div className="space-y-6">
                {experience.map((e, i) => (
                  <div key={i} className="relative pl-6 border-l-2 border-border">
                    <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-brass" />
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-[16px] font-sans font-semibold text-charcoal">{e.title}</p>
                        <p className="text-[14px] font-sans text-muted">{e.company}{e.location ? ` · ${e.location}` : ""}</p>
                      </div>
                      <span className={`text-[12px] font-sans px-2 py-0.5 flex-shrink-0 ${e.current ? "bg-green-50 text-green-700 border border-green-200" : "text-muted"}`}>
                        {e.startDate ?? "—"} – {e.current ? "Present" : (e.endDate ?? "—")}
                      </span>
                    </div>
                    {e.description && <p className="mt-2 text-[14px] font-sans text-muted leading-relaxed max-w-3xl">{e.description}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {education.length > 0 && (
            <Section title="Education" icon={<GraduationCap className="w-4 h-4" />}>
              <div className="divide-y divide-border">
                {education.map((e, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-[15px] font-sans font-semibold text-charcoal">{e.degree}{e.fieldOfStudy ? ` – ${e.fieldOfStudy}` : ""}</p>
                      <p className="text-[14px] font-sans text-muted mt-0.5">{e.institution}{e.grade ? ` · ${e.grade}` : ""}</p>
                    </div>
                    <span className="text-[13px] font-sans text-muted flex items-center gap-1.5 flex-shrink-0">
                      <Calendar className="w-3.5 h-3.5" />{[e.startYear, e.endYear].filter(Boolean).join(" – ")}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Side column */}
        <aside className="space-y-5 lg:sticky lg:top-[84px]">
          <div className="bg-surface border border-border p-6">
            <SideLabel>Profile strength</SideLabel>
            <div className="flex items-center justify-between mt-2">
              <span className="font-serif text-3xl font-bold text-navy leading-none">{c.profileStrength ?? 0}%</span>
            </div>
            <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-brass rounded-full" style={{ width: `${c.profileStrength ?? 0}%` }} />
            </div>
          </div>

          <div className="bg-surface border border-border p-6">
            <SideLabel>Contact</SideLabel>
            <div className="mt-3 space-y-2.5">
              <a href={`mailto:${c.email}`} className="flex items-center gap-2.5 text-[15px] font-sans text-navy hover:text-brass transition-colors break-all">
                <Mail className="w-4 h-4 text-muted flex-shrink-0" />{c.email}
              </a>
              {c.phone && <p className="flex items-center gap-2.5 text-[15px] font-sans text-charcoal"><Phone className="w-4 h-4 text-muted flex-shrink-0" />{c.phone}</p>}
              {c.city && <p className="flex items-center gap-2.5 text-[15px] font-sans text-charcoal"><MapPin className="w-4 h-4 text-muted flex-shrink-0" />{c.city}</p>}
            </div>
          </div>

          <div className="bg-surface border border-border p-6">
            <SideLabel>Resume</SideLabel>
            {c.resumeFile ? (
              <>
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-navy flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4 text-brass" /></div>
                  <p className="text-[13px] font-sans text-muted truncate">{c.resumeFile}</p>
                </div>
                <button type="button" onClick={openResume} disabled={busy === "resume"}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-surface bg-navy hover:bg-navy-mid transition-colors disabled:opacity-60">
                  <Download className="w-4 h-4" />{busy === "resume" ? "Opening…" : "Open resume"}
                </button>
                {resumeError && <p className="mt-2 text-[13px] font-sans text-red-600">{resumeError}</p>}
              </>
            ) : (
              <p className="mt-2 text-[14px] font-sans text-muted">No resume uploaded.</p>
            )}
          </div>

          <div className="bg-surface border border-border p-6">
            <SideLabel>Admin actions</SideLabel>
            <div className="mt-3 grid gap-2">
              <button type="button" disabled={c.status === "ACTIVE" || !!busy} onClick={() => setStatus("ACTIVE")}
                className="py-2.5 text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-surface bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Approve</button>
              <button type="button" disabled={c.status === "UNDER_REVIEW" || !!busy} onClick={() => setStatus("UNDER_REVIEW")}
                className="py-2.5 text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-charcoal bg-surface border border-border hover:bg-ivory disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Request info</button>
              <button type="button" disabled={c.status === "REJECTED" || !!busy} onClick={() => setStatus("REJECTED")}
                className="py-2.5 text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-red-600 bg-surface border border-red-200 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Reject</button>
            </div>
            <p className="mt-3 text-[12px] font-sans text-muted">The candidate is notified and e-mailed on every change.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-border p-7">
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-brass">{icon}</span>}
        <h2 className="text-[12px] font-sans font-semibold uppercase tracking-[0.22em] text-muted">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SideLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.22em] text-muted">{children}</p>;
}
