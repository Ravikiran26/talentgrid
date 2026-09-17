"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Building2, Globe, MapPin, ExternalLink } from "lucide-react";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatRelativeDate } from "@/lib/utils";
import Pager from "@/components/ui/Pager";

type Status = "ACTIVE" | "UNDER_REVIEW" | "REJECTED";
interface Employer {
  id: number; fullName: string; email: string; phone?: string; status: Status; createdAt: string;
  company: { id: number; name: string; website?: string | null; industry?: string | null; city?: string | null; size?: string | null } | null;
  openJobs: number; totalJobs: number;
}
const PAGE_SIZE = 20;
const STATUS_UI: Record<Status, { label: string; cls: string }> = {
  ACTIVE:       { label: "Verified",  cls: "text-green-700 border-green-200 bg-green-50" },
  UNDER_REVIEW: { label: "Pending",   cls: "text-amber-700 border-amber-200 bg-amber-50" },
  REJECTED:     { label: "Rejected",  cls: "text-red-600 border-red-200 bg-red-50" },
};

export default function AdminEmployersPage() {
  const router = useRouter();
  const [items, setItems] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState({ all: 0, active: 0, underReview: 0, rejected: 0 });
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search.trim()); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCounts = useCallback(async () => {
    try { setCounts(await api.get("/api/admin/employers/counts")); } catch { /* keep */ }
  }, []);

  const load = useCallback(async () => {
    setFetching(true);
    const qs = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
    if (query) qs.set("q", query);
    if (status !== "all") qs.set("status", status);
    try {
      const res = await api.getPage<Employer>(`/api/admin/employers?${qs.toString()}`);
      setItems(res.items); setTotalPages(res.totalPages); setTotalCount(res.totalCount);
    } catch { setItems([]); }
    finally { setLoading(false); setFetching(false); }
  }, [page, query, status]);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "ADMIN") { router.push("/"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [router, load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCounts();
  }, [fetchCounts]);

  async function setEmployerStatus(id: number, next: Status) {
    setBusy(id);
    try {
      const updated = await api.patch<Employer>(`/api/admin/employers/${id}/status`, { status: next });
      setItems((prev) => prev.map((e) => (e.id === id ? updated : e)));
      fetchCounts();
    } catch { /* ignore */ } finally { setBusy(null); }
  }

  const tabs: { key: "all" | Status; label: string; n: number }[] = [
    { key: "all", label: "All", n: counts.all },
    { key: "UNDER_REVIEW", label: "Pending", n: counts.underReview },
    { key: "ACTIVE", label: "Verified", n: counts.active },
    { key: "REJECTED", label: "Rejected", n: counts.rejected },
  ];

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div>
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-1">Admin Dashboard</p>
            <h1 className="font-serif text-3xl font-bold text-surface">Employers</h1>
            <p className="text-[15px] font-sans text-navy-text mt-1">{counts.all} registered · {counts.underReview} awaiting verification</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {tabs.map((t) => (
              <button key={t.key} type="button" onClick={() => { setStatus(t.key); setPage(0); }}
                className={`text-[12px] font-sans font-semibold uppercase tracking-[0.16em] px-4 py-2 border transition-colors ${
                  status === t.key ? "bg-brass border-brass text-navy" : "border-navy-border text-navy-text hover:border-brass/50 hover:text-brass"}`}>
                {t.label} ({t.n})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or e-mail…"
            className="w-full pl-11 pr-4 py-3 text-[15px] font-sans text-charcoal placeholder-muted bg-surface border border-border focus:outline-none focus:border-navy transition-colors" />
        </div>

        {loading ? (
          <p className="text-[15px] font-sans text-muted py-16 text-center">Loading employers…</p>
        ) : items.length === 0 ? (
          <div className="py-20 text-center bg-surface border border-border">
            <Building2 className="w-8 h-8 text-muted mx-auto mb-3" />
            <p className="text-[15px] font-sans text-muted">{counts.all === 0 ? "No employers registered yet." : "No employers match."}</p>
          </div>
        ) : (
          <div className={`bg-surface border border-border divide-y divide-border ${fetching ? "opacity-60" : ""}`}>
            {items.map((e) => {
              const ui = STATUS_UI[e.status];
              return (
                <div key={e.id} className="px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-4 min-w-0">
                    <p className="font-serif text-[1.16rem] font-semibold text-navy leading-snug">{e.company?.name ?? <span className="text-muted italic">No company profile yet</span>}</p>
                    <p className="text-[14px] font-sans text-charcoal mt-0.5">{e.fullName} · <a href={`mailto:${e.email}`} className="hover:text-navy">{e.email}</a></p>
                    {e.phone && <p className="text-[13px] font-sans text-muted">{e.phone}</p>}
                  </div>
                  <div className="lg:col-span-3 text-[13.5px] font-sans text-muted space-y-1">
                    {e.company?.industry && <p>{e.company.industry}{e.company.size ? ` · ${e.company.size} employees` : ""}</p>}
                    {e.company?.city && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.company.city}</p>}
                    {e.company?.website && <p className="flex items-center gap-1 truncate"><Globe className="w-3 h-3 flex-shrink-0" />{e.company.website}</p>}
                  </div>
                  <div className="lg:col-span-2 text-[13.5px] font-sans text-muted">
                    <p>{e.openJobs} open / {e.totalJobs} total jobs</p>
                    <p>Registered {formatRelativeDate(e.createdAt)}</p>
                    {e.company && (
                      <Link href={`/companies/${e.company.id}`} target="_blank" className="inline-flex items-center gap-1 text-navy hover:text-brass mt-1">
                        Public page <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <div className="lg:col-span-3 flex items-center lg:justify-end gap-2 flex-wrap">
                    <span className={`text-[11px] font-sans font-bold uppercase tracking-[0.16em] px-2 py-1 border ${ui.cls}`}>{ui.label}</span>
                    {e.status !== "ACTIVE" && (
                      <button type="button" disabled={busy === e.id} onClick={() => setEmployerStatus(e.id, "ACTIVE")}
                        className="text-[12px] font-sans font-semibold uppercase tracking-[0.14em] text-green-700 border border-green-300 px-3 py-1.5 hover:bg-green-50 disabled:opacity-50">Approve</button>
                    )}
                    {e.status !== "REJECTED" && (
                      <button type="button" disabled={busy === e.id} onClick={() => setEmployerStatus(e.id, "REJECTED")}
                        className="text-[12px] font-sans font-semibold uppercase tracking-[0.14em] text-red-600 border border-red-200 px-3 py-1.5 hover:bg-red-50 disabled:opacity-50">Reject</button>
                    )}
                    {e.status !== "UNDER_REVIEW" && (
                      <button type="button" disabled={busy === e.id} onClick={() => setEmployerStatus(e.id, "UNDER_REVIEW")}
                        className="text-[12px] font-sans text-muted hover:text-navy disabled:opacity-50">Set pending</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Pager page={page} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} onChange={setPage} disabled={fetching} />
      </div>
    </div>
  );
}
