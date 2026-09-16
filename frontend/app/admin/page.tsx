"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  X, Download, Mail, Phone, MapPin, Briefcase,
  GraduationCap, FileText, Calendar, ChevronRight,
  Search, SlidersHorizontal, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatRelativeDate } from "@/lib/utils";

/* ── Types matching backend DTOs ────────────────────────────── */
type BackendStatus = "ACTIVE" | "UNDER_REVIEW" | "REJECTED";
type FrontendStatus = "active" | "review" | "rejected";

interface ExperienceDto {
  title: string; company: string; location?: string;
  startDate: string; endDate: string; current: boolean; description: string;
}
interface EducationDto {
  institution: string; degree: string; fieldOfStudy?: string;
  startYear: string; endYear: string; grade?: string;
}

interface CandidateSummary {
  id: string | number;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  totalExp?: string;
  headline?: string;
  skills?: string[];
  about?: string;
  status: BackendStatus;
  appliedAt?: string;
  profileStrength?: number;
}

interface CandidateDetail extends CandidateSummary {
  experience?: ExperienceDto[];
  education?: EducationDto[];
  resumeFile?: string;
}

/* ── Frontend view model ────────────────────────────────────── */
interface Candidate {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  headline: string;
  email: string;
  phone: string;
  city: string;
  totalExp: string;
  skills: string[];
  about: string;
  experience: { title: string; company: string; start: string; end: string; current: boolean; description: string }[];
  education: { degree: string; institution: string; year: string }[];
  resumeFile: string;
  status: FrontendStatus;
  appliedAt: string;
  profileStrength: number;
}

const AVATAR_COLORS = [
  "#1A2F4A", "#6B3A2A", "#1C3D2A", "#3A2A5A",
  "#2A3A1A", "#4A1A2A", "#1A3A4A", "#3A1A4A",
];

function toInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function mapStatus(s: BackendStatus): FrontendStatus {
  if (s === "ACTIVE") return "active";
  if (s === "REJECTED") return "rejected";
  return "review";
}

function mapSummary(c: CandidateSummary, idx: number): Candidate {
  return {
    id: String(c.id),
    name: c.fullName,
    initials: toInitials(c.fullName),
    avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
    headline: c.headline ?? "",
    email: c.email,
    phone: c.phone ?? "",
    city: c.city ?? "",
    totalExp: c.totalExp ?? "",
    skills: c.skills ?? [],
    about: c.about ?? "",
    experience: [],
    education: [],
    resumeFile: "",
    status: mapStatus(c.status),
    appliedAt: formatRelativeDate(c.appliedAt ?? ""),
    profileStrength: c.profileStrength ?? 0,
  };
}

function mergeDetail(base: Candidate, d: CandidateDetail): Candidate {
  return {
    ...base,
    experience: (d.experience ?? []).map((e) => ({
      title: e.title,
      company: e.company,
      start: e.startDate,
      end: e.endDate,
      current: e.current,
      description: e.description,
    })),
    education: (d.education ?? []).map((e) => ({
      degree: `${e.degree}${e.fieldOfStudy ? ` – ${e.fieldOfStudy}` : ""}`,
      institution: e.institution,
      year: e.endYear,
    })),
    resumeFile: d.resumeFile ?? "",
  };
}

const STATUS_CONFIG = {
  active:   { label: "Active",       color: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500",  icon: CheckCircle2 },
  review:   { label: "Under Review", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500",  icon: Clock },
  rejected: { label: "Rejected",     color: "bg-red-100 text-red-700 border-red-200",        dot: "bg-red-400",    icon: XCircle },
};

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Candidate | null>(null);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FrontendStatus>("all");

  const fetchCandidates = useCallback(async () => {
    try {
      const data = await api.get<CandidateSummary[]>("/api/admin/candidates");
      setCandidates(data.map((c, i) => mapSummary(c, i)));
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    fetchCandidates();
  }, [router, fetchCandidates]);

  async function openDetail(c: Candidate) {
    setSelected(c);
    try {
      const detail = await api.get<CandidateDetail>(`/api/admin/candidates/${c.id}`);
      setSelected(mergeDetail(c, detail));
    } catch {
      // keep the summary-level data already shown
    }
  }

  async function updateStatus(id: string, status: BackendStatus) {
    try {
      await api.patch(`/api/admin/candidates/${id}/status`, { status });
      const frontendStatus = mapStatus(status);
      setCandidates((prev) =>
        prev.map((c) => c.id === id ? { ...c, status: frontendStatus } : c)
      );
      setSelected((prev) => prev ? { ...prev, status: frontendStatus } : prev);
    } catch {
      // silently ignore — toast system can be wired later
    }
  }

  if (loading) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <p className="text-[13px] font-sans text-muted">Loading candidates…</p>
      </div>
    );
  }

  const filtered = candidates.filter((c) => {
    const kw = search.toLowerCase();
    const matchSearch = !search ||
      c.name.toLowerCase().includes(kw) ||
      c.headline.toLowerCase().includes(kw) ||
      c.city.toLowerCase().includes(kw);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all:      candidates.length,
    active:   candidates.filter((c) => c.status === "active").length,
    review:   candidates.filter((c) => c.status === "review").length,
    rejected: candidates.filter((c) => c.status === "rejected").length,
  };

  return (
    <div className="bg-ivory min-h-screen">

      {/* ── Page header ── */}
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div>
            <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-1">
              Admin Dashboard
            </p>
            <h1 className="font-serif text-2xl font-bold text-surface">Candidate Profiles</h1>
            <p className="text-[13px] font-sans text-[#8A9DB5] mt-1">
              {candidates.length} registered {candidates.length === 1 ? "candidate" : "candidates"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "active", "review", "rejected"] as const).map((s) => (
              <button key={s} type="button"
                onClick={() => setStatusFilter(s)}
                className={`text-[10px] font-sans font-semibold uppercase tracking-[0.16em] px-4 py-2 border transition-colors duration-150 ${
                  statusFilter === s
                    ? "bg-brass border-brass text-navy"
                    : "border-navy-border text-[#8A9DB5] hover:border-brass/50 hover:text-brass"
                }`}>
                {s === "all" ? `All (${counts.all})` : s === "active" ? `Active (${counts.active})` : s === "review" ? `Review (${counts.review})` : `Rejected (${counts.rejected})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">

        {/* Search bar */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, or city..."
            className="w-full pl-11 pr-4 py-3 text-[13px] font-sans text-charcoal placeholder-muted bg-surface border border-border focus:outline-none focus:border-navy transition-colors"
          />
        </div>

        {/* Candidate grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <CandidateCard key={c.id} candidate={c} onClick={() => openDetail(c)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center bg-surface border border-border">
            <SlidersHorizontal className="w-8 h-8 text-muted mx-auto mb-3" />
            <p className="text-[13px] font-sans text-muted">
              {candidates.length === 0 ? "No candidates registered yet." : "No candidates match your search."}
            </p>
          </div>
        )}
      </div>

      {/* ── Detail panel ── */}
      {selected && (
        <DetailPanel
          candidate={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(status) => updateStatus(selected.id, status)}
        />
      )}
    </div>
  );
}

/* ── Candidate card ─────────────────────────────────────────── */
function CandidateCard({ candidate: c, onClick }: { candidate: Candidate; onClick: () => void }) {
  const status = STATUS_CONFIG[c.status];

  return (
    <button
      type="button" onClick={onClick}
      className="group bg-surface border border-border hover:border-brass/40 text-left transition-all duration-200 overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      {/* Profile strength bar */}
      <div className="h-[3px] bg-border">
        <div className="h-full bg-brass transition-all duration-500" style={{ width: `${c.profileStrength}%` }} />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 group-hover:ring-2 group-hover:ring-brass/40 transition-all duration-200"
            style={{ backgroundColor: c.avatarColor }}
          >
            <span className="font-serif text-lg font-bold text-surface">{c.initials}</span>
          </div>
          <span className={`flex items-center gap-1.5 text-[10px] font-sans font-semibold px-2 py-1 border ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <h3 className="font-serif text-[1rem] font-bold text-navy group-hover:text-navy-mid leading-tight mb-1 transition-colors">
          {c.name}
        </h3>
        <p className="text-[11px] font-sans text-muted leading-snug mb-3 line-clamp-2">
          {c.headline || "—"}
        </p>

        <div className="flex items-center gap-3 text-[10px] font-sans text-muted mb-3">
          {c.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />{c.city}
            </span>
          )}
          {c.totalExp && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />{c.totalExp}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {c.skills.slice(0, 3).map((s) => (
            <span key={s} className="text-[9px] font-sans text-muted border border-border px-2 py-0.5 group-hover:border-navy/20 transition-colors">
              {s}
            </span>
          ))}
          {c.skills.length > 3 && (
            <span className="text-[9px] font-sans text-muted/60 px-1 py-0.5">+{c.skills.length - 3}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-[10px] font-sans text-muted">{c.appliedAt}</span>
          <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-navy group-hover:text-brass transition-colors flex items-center gap-1">
            View Profile <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ── Detail panel ───────────────────────────────────────────── */
function DetailPanel({
  candidate: c, onClose, onStatusChange,
}: {
  candidate: Candidate;
  onClose: () => void;
  onStatusChange: (status: BackendStatus) => void;
}) {
  const status = STATUS_CONFIG[c.status];
  const [resumeDownloading, setResumeDownloading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  async function handleDownloadResume() {
    setResumeDownloading(true);
    setResumeError(null);
    try {
      const blob = await api.downloadBlob(`/api/admin/candidates/${c.id}/resume`);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to open resume.";
      setResumeError(message);
    } finally {
      setResumeDownloading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-navy/50 z-40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-surface z-50 overflow-y-auto"
        style={{ boxShadow: "-8px 0 40px rgba(0,0,0,0.2)" }}>

        {/* Panel header */}
        <div className="sticky top-0 bg-navy z-10 border-b border-navy-border">
          <div className="h-[2px] bg-brass" />
          <div className="px-8 py-5 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: c.avatarColor }}>
                <span className="font-serif text-lg font-bold text-surface">{c.initials}</span>
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-surface leading-tight">{c.name}</h2>
                <p className="text-[11px] font-sans text-[#8A9DB5] mt-0.5">
                  {[c.city, c.totalExp].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose}
              className="text-[#8A9DB5] hover:text-surface transition-colors mt-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-7">

          {/* Status + strength */}
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1.5 text-[11px] font-sans font-semibold px-3 py-1.5 border ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-sans font-semibold uppercase tracking-[0.18em] text-muted">Profile Strength</span>
                <span className="text-[11px] font-sans font-semibold text-brass">{c.profileStrength}%</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-brass rounded-full" style={{ width: `${c.profileStrength}%` }} />
              </div>
            </div>
          </div>

          {/* Headline */}
          {c.headline && (
            <div>
              <Label>Professional Headline</Label>
              <p className="text-[13px] font-sans text-charcoal mt-1">{c.headline}</p>
            </div>
          )}

          {/* Contact */}
          <div>
            <Label>Contact Details</Label>
            <div className="mt-2 space-y-2">
              <a href={`mailto:${c.email}`}
                className="flex items-center gap-2.5 text-[13px] font-sans text-navy hover:text-brass transition-colors">
                <Mail className="w-3.5 h-3.5 text-muted flex-shrink-0" />{c.email}
              </a>
              {c.phone && (
                <p className="flex items-center gap-2.5 text-[13px] font-sans text-charcoal">
                  <Phone className="w-3.5 h-3.5 text-muted flex-shrink-0" />{c.phone}
                </p>
              )}
              {c.city && (
                <p className="flex items-center gap-2.5 text-[13px] font-sans text-charcoal">
                  <MapPin className="w-3.5 h-3.5 text-muted flex-shrink-0" />{c.city}
                </p>
              )}
            </div>
          </div>

          {/* About */}
          {c.about && (
            <div>
              <Label>About</Label>
              <p className="mt-2 text-[13px] font-sans text-muted leading-relaxed">{c.about}</p>
            </div>
          )}

          {/* Skills */}
          {c.skills.length > 0 && (
            <div>
              <Label>Skills</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {c.skills.map((s) => (
                  <span key={s} className="text-[11px] font-sans bg-navy text-surface px-3 py-1.5">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {c.experience.length > 0 && (
            <div>
              <Label icon={<Briefcase className="w-3.5 h-3.5" />}>Work Experience</Label>
              <div className="mt-3 space-y-5">
                {c.experience.map((e, i) => (
                  <div key={i} className="relative pl-5 border-l-2 border-border">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-brass" />
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-[13px] font-sans font-semibold text-charcoal">{e.title}</p>
                        <p className="text-[12px] font-sans text-muted">{e.company}</p>
                      </div>
                      <span className={`text-[10px] font-sans px-2 py-0.5 flex-shrink-0 ${
                        e.current ? "bg-green-50 text-green-700 border border-green-200" : "text-muted"
                      }`}>
                        {e.current ? "Current" : `${e.start} – ${e.end}`}
                      </span>
                    </div>
                    {e.current && (
                      <p className="text-[10px] font-sans text-muted mt-0.5">{e.start} – Present</p>
                    )}
                    <p className="mt-2 text-[12px] font-sans text-muted leading-relaxed">{e.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {c.education.length > 0 && (
            <div>
              <Label icon={<GraduationCap className="w-3.5 h-3.5" />}>Education</Label>
              <div className="mt-3 space-y-3">
                {c.education.map((e, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-b-0">
                    <div>
                      <p className="text-[13px] font-sans font-semibold text-charcoal">{e.degree}</p>
                      <p className="text-[12px] font-sans text-muted mt-0.5">{e.institution}</p>
                    </div>
                    <span className="text-[11px] font-sans text-muted flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3" />{e.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume */}
          {c.resumeFile && (
            <div>
              <Label icon={<FileText className="w-3.5 h-3.5" />}>Resume</Label>
              <div className="mt-3 flex items-center justify-between border border-border bg-ivory px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-navy flex items-center justify-center">
                    <FileText className="w-4 h-4 text-brass" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-sans font-medium text-charcoal truncate">{c.resumeFile}</p>
                    <p className="text-[10px] font-sans text-muted">Uploaded resume</p>
                  </div>
                </div>
                <button type="button"
                  onClick={handleDownloadResume}
                  disabled={resumeDownloading}
                  className="flex items-center gap-2 text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-surface bg-navy hover:bg-navy-mid px-4 py-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  <Download className="w-3.5 h-3.5" />
                  {resumeDownloading ? "Opening…" : "Open"}
                </button>
              </div>
              {resumeError && (
                <p className="mt-2 text-[11px] font-sans text-red-600">{resumeError}</p>
              )}
            </div>
          )}

          {/* Admin actions */}
          <div className="border-t border-border pt-6">
            <Label>Admin Actions</Label>
            <div className="mt-3 flex gap-3 flex-wrap">
              <button type="button"
                disabled={c.status === "active"}
                onClick={() => onStatusChange("ACTIVE")}
                className="flex-1 py-2.5 text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-surface bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Approve
              </button>
              <button type="button"
                disabled={c.status === "review"}
                onClick={() => onStatusChange("UNDER_REVIEW")}
                className="flex-1 py-2.5 text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-charcoal bg-surface border border-border hover:bg-ivory disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Request Info
              </button>
              <button type="button"
                disabled={c.status === "rejected"}
                onClick={() => onStatusChange("REJECTED")}
                className="flex-1 py-2.5 text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-red-600 bg-surface border border-red-200 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Reject
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

function Label({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-brass">{icon}</span>}
      <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.22em] text-muted">{children}</p>
    </div>
  );
}
