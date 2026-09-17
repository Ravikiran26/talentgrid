"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Briefcase, ChevronRight,
  Search, SlidersHorizontal, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatRelativeDate } from "@/lib/utils";
import Pager from "@/components/ui/Pager";
import CandidateAvatar from "@/components/admin/CandidateAvatar";

const PAGE_SIZE = 20;
const STATUS_PARAM: Record<FrontendStatus, BackendStatus> = { active: "ACTIVE", review: "UNDER_REVIEW", rejected: "REJECTED" };

/* ── Types matching backend DTOs ────────────────────────────── */
type BackendStatus = "ACTIVE" | "UNDER_REVIEW" | "REJECTED";
type FrontendStatus = "active" | "review" | "rejected";


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
  hasPhoto?: boolean;
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
  hasPhoto: boolean;
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
    hasPhoto: c.hasPhoto ?? false,
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
  const [search, setSearch]         = useState("");
  const [query, setQuery]           = useState("");       // debounced copy of `search`
  const [statusFilter, setStatusFilter] = useState<"all" | FrontendStatus>("all");
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [fetching, setFetching]     = useState(false);
  const [counts, setCounts]         = useState({ all: 0, active: 0, review: 0, rejected: 0 });

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search.trim()); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCounts = useCallback(async () => {
    try {
      const c = await api.get<{ all: number; active: number; underReview: number; rejected: number }>("/api/admin/candidates/counts");
      setCounts({ all: c.all, active: c.active, review: c.underReview, rejected: c.rejected });
    } catch { /* keep previous */ }
  }, []);

  const fetchCandidates = useCallback(async () => {
    setFetching(true);
    const qs = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
    if (query) qs.set("q", query);
    if (statusFilter !== "all") qs.set("status", STATUS_PARAM[statusFilter]);
    try {
      const res = await api.getPage<CandidateSummary>(`/api/admin/candidates?${qs.toString()}`);
      setCandidates(res.items.map((c, i) => mapSummary(c, page * PAGE_SIZE + i)));
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [page, query, statusFilter]);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCandidates();
  }, [router, fetchCandidates]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCounts();
  }, [fetchCounts]);

  function openDetail(c: Candidate) {
    router.push(`/admin/candidates/${c.id}`);
  }


  if (loading) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <p className="text-[15px] font-sans text-muted">Loading candidates…</p>
      </div>
    );
  }

  const filtered = candidates;

  return (
    <div className="bg-ivory min-h-screen">

      {/* ── Page header ── */}
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div>
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-1">
              Admin Dashboard
            </p>
            <h1 className="font-serif text-3xl font-bold text-surface">Candidate Profiles</h1>
            <p className="text-[15px] font-sans text-navy-text mt-1">
              {counts.all} registered {counts.all === 1 ? "candidate" : "candidates"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "active", "review", "rejected"] as const).map((s) => (
              <button key={s} type="button"
                onClick={() => { setStatusFilter(s); setPage(0); }}
                className={`text-[12px] font-sans font-semibold uppercase tracking-[0.16em] px-4 py-2 border transition-colors duration-150 ${
                  statusFilter === s
                    ? "bg-brass border-brass text-navy"
                    : "border-navy-border text-navy-text hover:border-brass/50 hover:text-brass"
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
            className="w-full pl-11 pr-4 py-3 text-[15px] font-sans text-charcoal placeholder-muted bg-surface border border-border focus:outline-none focus:border-navy transition-colors"
          />
        </div>

        {/* Candidate grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${fetching ? "opacity-60" : ""}`}>
          {filtered.map((c) => (
            <CandidateCard key={c.id} candidate={c} onClick={() => openDetail(c)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center bg-surface border border-border">
            <SlidersHorizontal className="w-8 h-8 text-muted mx-auto mb-3" />
            <p className="text-[15px] font-sans text-muted">
              {counts.all === 0 ? "No candidates registered yet." : "No candidates match your search."}
            </p>
          </div>
        )}

        <Pager page={page} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} onChange={setPage} disabled={fetching} />
      </div>
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
          <CandidateAvatar
            candidateId={c.id} hasPhoto={c.hasPhoto} initials={c.initials} color={c.avatarColor}
            className="w-14 h-14 group-hover:ring-2 group-hover:ring-brass/40 transition-all duration-200"
          />
          <span className={`flex items-center gap-1.5 text-[12px] font-sans font-semibold px-2 py-1 border ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <h3 className="font-serif text-[1.1rem] font-bold text-navy group-hover:text-navy-mid leading-tight mb-1 transition-colors">
          {c.name}
        </h3>
        <p className="text-[13px] font-sans text-muted leading-snug mb-3 line-clamp-2">
          {c.headline || "—"}
        </p>

        <div className="flex items-center gap-3 text-[12px] font-sans text-muted mb-3">
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
            <span key={s} className="text-[11px] font-sans text-muted border border-border px-2 py-0.5 group-hover:border-navy/20 transition-colors">
              {s}
            </span>
          ))}
          {c.skills.length > 3 && (
            <span className="text-[11px] font-sans text-muted/60 px-1 py-0.5">+{c.skills.length - 3}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-[12px] font-sans text-muted">{c.appliedAt}</span>
          <span className="text-[12px] font-sans font-semibold uppercase tracking-[0.14em] text-navy group-hover:text-brass transition-colors flex items-center gap-1">
            View Profile <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ── Detail panel ───────────────────────────────────────────── */
