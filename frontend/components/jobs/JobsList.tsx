"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, SlidersHorizontal, X } from "lucide-react";
import type { FilterState, Job } from "@/types";
import JobCard    from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import JobSearch  from "@/components/jobs/JobSearch";
import { api, ApiError } from "@/lib/api";
import { normalizeJob } from "@/lib/jobs";
import { getUser } from "@/lib/auth";

const PAGE_SIZE = 20;

const DF: FilterState = {
  category: "", experienceMin: null, experienceMax: null,
  location: "", salaryMin: null, employmentType: "", datePosted: "",
};

const SORT_OPTIONS = {
  recent:     { label: "Latest",     param: "postedAt,desc"    },
  salary:     { label: "Salary",     param: "salaryMax,desc"   },
  experience: { label: "Experience", param: "experienceMin,asc" },
} as const;

type SortKey = keyof typeof SORT_OPTIONS;

interface Props {
  initialCategory?: string;
  initialKeyword?: string;
  initialLocation?: string;
  initialSort?: string;
  /** "6-10" or "10+" from the hero search, expanded into the min/max filter. */
  initialExperience?: string;
}

function parseExperience(v: string): { experienceMin: number | null; experienceMax: number | null } {
  if (!v) return { experienceMin: null, experienceMax: null };
  if (v.endsWith("+")) return { experienceMin: Number(v.slice(0, -1)) || 0, experienceMax: 99 };
  const [min, max] = v.split("-").map(Number);
  if (Number.isNaN(min) || Number.isNaN(max)) return { experienceMin: null, experienceMax: null };
  return { experienceMin: min, experienceMax: max };
}

function toSortKey(s: string): SortKey {
  return (s in SORT_OPTIONS ? s : "recent") as SortKey;
}

export default function JobsList({
  initialCategory = "",
  initialKeyword = "",
  initialLocation = "",
  initialSort = "",
  initialExperience = "",
}: Props) {
  const router   = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = useState<FilterState>({
    ...DF, category: initialCategory, location: initialLocation, ...parseExperience(initialExperience),
  });
  const [keyword, setKeyword] = useState(initialKeyword);
  const [sortBy,  setSortBy]  = useState<SortKey>(toSortKey(initialSort));
  const [drawer,  setDrawer]  = useState(false);

  const [items, setItems]         = useState<Job[]>([]);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  // Load the candidate's applied jobs once, so we can show "Applied" badges.
  useEffect(() => {
    const user = getUser();
    if (user?.role !== "CANDIDATE") return;
    api.get<{ jobId: number | string }[]>("/api/applications/my")
      .then((rows) => setAppliedIds(new Set(rows.map((r) => String(r.jobId)))))
      .catch(() => {/* not fatal — cards just won't show the badge */});
  }, []);

  const fetchPage = useCallback(async (pageToFetch: number, append: boolean) => {
    const qs = new URLSearchParams();
    if (keyword)          qs.set("q", keyword);
    if (filters.category) qs.set("category", filters.category);
    if (filters.location) qs.set("location", filters.location);
    if (filters.employmentType)         qs.set("employmentType", filters.employmentType);
    if (filters.experienceMin !== null) qs.set("experienceMin", String(filters.experienceMin));
    if (filters.experienceMax !== null) qs.set("experienceMax", String(filters.experienceMax));
    if (filters.salaryMin !== null)     qs.set("salaryMin", String(filters.salaryMin));
    qs.set("page", String(pageToFetch));
    qs.set("size", String(PAGE_SIZE));
    qs.set("sort", SORT_OPTIONS[sortBy].param);

    if (append) setLoadingMore(true); else setLoading(true);
    setError(null);
    try {
      const res = await api.getPage<Record<string, unknown>>(`/api/jobs?${qs.toString()}`);
      const mapped = res.items.map(normalizeJob);
      setItems((prev) => (append ? [...prev, ...mapped] : mapped));
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
      setPage(pageToFetch);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to load roles.";
      setError(msg);
      if (!append) setItems([]);
    } finally {
      if (append) setLoadingMore(false); else setLoading(false);
    }
  }, [keyword, filters.category, filters.location, filters.employmentType,
      filters.experienceMin, filters.experienceMax, filters.salaryMin, sortBy]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(0, false);
  }, [fetchPage]);

  // Reflect server-side filters + sort in the URL so views are shareable.
  useEffect(() => {
    const params = new URLSearchParams();
    if (keyword)          params.set("q", keyword);
    if (filters.category) params.set("category", filters.category);
    if (filters.location) params.set("location", filters.location);
    if (sortBy !== "recent") params.set("sort", sortBy);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [keyword, filters.category, filters.location, sortBy, pathname, router]);

  // Every filter is applied server-side, so the list is exactly what the API returned.
  const filtered = items;

  const hasActive = keyword || filters.category || filters.location ||
    filters.employmentType || filters.experienceMin !== null || filters.salaryMin !== null;
  const hasMore = page + 1 < totalPages;

  function clear() { setFilters(DF); setKeyword(""); }

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6">
        <JobSearch compact defaultKeyword={keyword} defaultLocation={filters.location}
          key={`${keyword}-${filters.location}`} />
      </div>

      {/* Desktop filters */}
      <div className="hidden md:flex items-center gap-2.5 flex-wrap mb-6">
        <JobFilters filters={filters} onChange={setFilters} />
        {hasActive && (
          <button type="button" onClick={clear}
            className="flex items-center gap-1.5 text-[13px] font-sans text-muted hover:text-charcoal transition-colors ml-2">
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      {/* Mobile filter toggle */}
      <div className="md:hidden flex items-center justify-between mb-5">
        <button type="button" onClick={() => setDrawer(!drawer)}
          className="flex items-center gap-2 text-[14px] font-sans text-charcoal border border-border px-3 py-2 hover:bg-surface transition-colors">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters {hasActive && <span className="w-1.5 h-1.5 rounded-full bg-brass ml-1" />}
        </button>
        {hasActive && (
          <button type="button" onClick={clear}
            className="text-[13px] font-sans text-muted hover:text-charcoal flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
      {drawer && (
        <div className="md:hidden mb-5 p-4 bg-surface border border-border">
          <JobFilters filters={filters} onChange={setFilters} />
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-red-50 border border-red-200 px-4 py-3">
          <p className="flex items-center gap-2 text-[14px] font-sans text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
          <button type="button" onClick={() => fetchPage(0, false)}
            className="text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-red-700 hover:text-red-900 transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between py-3 border-t border-b border-border mb-1">
        <p className="text-[14px] font-sans text-muted">
          <span className="font-serif text-[1.21rem] font-semibold text-charcoal">
            {loading ? "…" : totalCount}
          </span>
          {" "}open {totalCount === 1 ? "role" : "roles"}
          {!loading && totalCount > items.length && (
            <span className="ml-2 text-muted/60">· showing {items.length}</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-[13px] font-sans text-muted">Sort:</label>
          <select id="sort" value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="text-[13px] font-sans text-muted bg-transparent border-0 focus:outline-none cursor-pointer">
            {(Object.entries(SORT_OPTIONS) as [SortKey, { label: string }][]).map(([k, o]) => (
              <option key={k} value={k}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Job list */}
      {loading ? (
        <div className="py-20 text-center border border-border border-t-0 bg-surface">
          <p className="text-[15px] font-sans text-muted">Loading roles…</p>
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="bg-surface border border-border border-t-0">
            {filtered.map((j) => (
              <JobCard key={j.id} job={j} applied={appliedIds.has(j.id)} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-6 text-center">
              <button type="button"
                onClick={() => fetchPage(page + 1, true)}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 text-[13px] font-sans font-semibold uppercase tracking-[0.18em] text-navy border border-navy hover:bg-navy hover:text-surface px-8 py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {loadingMore ? "Loading…" : "Load more roles →"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center border border-border border-t-0 bg-surface">
          <p className="text-[15px] font-sans text-muted">
            {error ? "Couldn't load roles." : "No roles match your criteria."}
          </p>
          {(hasActive && !error) && (
            <button type="button" onClick={clear}
              className="mt-4 text-[14px] font-sans text-navy underline underline-offset-4 hover:text-navy-mid transition-colors">
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
