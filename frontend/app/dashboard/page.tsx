"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, MapPin, CheckCircle2, Clock, XCircle, ChevronRight } from "lucide-react";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatRelativeDate } from "@/lib/utils";

interface Application {
  id: string | number;
  jobId: string | number;
  jobTitle: string;
  company: string;
  location: string;
  status: "APPLIED" | "SHORTLISTED" | "REJECTED";
  appliedAt: string;
}

const STATUS_CONFIG = {
  APPLIED:     { label: "Applied",     color: "bg-blue-50 text-blue-700 border-blue-200",    dot: "bg-blue-400",   icon: Clock },
  SHORTLISTED: { label: "Shortlisted", color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500",  icon: CheckCircle2 },
  REJECTED:    { label: "Not Selected", color: "bg-red-50 text-red-600 border-red-200",      dot: "bg-red-400",    icon: XCircle },
};

export default function DashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"ALL" | "APPLIED" | "SHORTLISTED" | "REJECTED">("ALL");

  const fetchApplications = useCallback(async () => {
    try {
      const data = await api.get<Application[]>("/api/applications/my");
      setApplications(data);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "CANDIDATE") { router.push("/"); return; }
    fetchApplications();
  }, [router, fetchApplications]);

  const filtered = filter === "ALL"
    ? applications
    : applications.filter((a) => a.status === filter);

  const counts = {
    ALL:         applications.length,
    APPLIED:     applications.filter((a) => a.status === "APPLIED").length,
    SHORTLISTED: applications.filter((a) => a.status === "SHORTLISTED").length,
    REJECTED:    applications.filter((a) => a.status === "REJECTED").length,
  };

  return (
    <div className="bg-ivory min-h-screen">

      {/* Page header */}
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-screen-lg mx-auto px-6 lg:px-10 py-8">
          <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-1">
            My Dashboard
          </p>
          <h1 className="font-serif text-2xl font-bold text-surface">My Applications</h1>
          <p className="text-[13px] font-sans text-[#8A9DB5] mt-1">
            {applications.length} {applications.length === 1 ? "application" : "applications"} submitted
          </p>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-6 lg:px-10 py-8">

        {/* Status filter tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {(["ALL", "APPLIED", "SHORTLISTED", "REJECTED"] as const).map((s) => (
            <button key={s} type="button"
              onClick={() => setFilter(s)}
              className={`text-[10px] font-sans font-semibold uppercase tracking-[0.16em] px-4 py-2 border transition-colors duration-150 ${
                filter === s
                  ? "bg-navy border-navy text-surface"
                  : "border-border text-muted hover:border-navy/40 hover:text-charcoal"
              }`}>
              {s === "ALL" ? `All (${counts.ALL})` :
               s === "APPLIED" ? `Applied (${counts.APPLIED})` :
               s === "SHORTLISTED" ? `Shortlisted (${counts.SHORTLISTED})` :
               `Not Selected (${counts.REJECTED})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-[13px] font-sans text-muted">Loading your applications…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-surface border border-border">
            <Briefcase className="w-8 h-8 text-muted mx-auto mb-3" />
            <p className="text-[13px] font-sans text-muted font-medium">
              {applications.length === 0 ? "No applications yet." : "No applications in this category."}
            </p>
            {applications.length === 0 && (
              <Link href="/jobs"
                className="mt-4 inline-block text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid px-6 py-2.5 transition-colors">
                Browse Opportunities →
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-surface border border-border">
            {filtered.map((app) => {
              const cfg = STATUS_CONFIG[app.status];
              return (
                <div key={app.id}
                  className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border last:border-b-0 hover:bg-[#FDFAF6] transition-colors">

                  <div className="flex items-start gap-4 min-w-0">
                    {/* Company initials */}
                    <div className="w-10 h-10 bg-ivory border border-border flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-sans font-bold text-muted">
                        {app.company.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <Link href={`/jobs/${app.jobId}`}
                        className="font-serif text-[1rem] font-semibold text-navy hover:text-brass transition-colors leading-snug block truncate">
                        {app.jobTitle}
                      </Link>
                      <p className="text-[12px] font-sans text-muted mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{app.company}</span>
                        {app.location && (
                          <>
                            <span className="text-border">·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{app.location}
                            </span>
                          </>
                        )}
                      </p>
                      <p className="text-[11px] font-sans text-muted/70 mt-1">
                        Applied {formatRelativeDate(app.appliedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className={`flex items-center gap-1.5 text-[10px] font-sans font-semibold px-3 py-1.5 border ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                    <Link href={`/jobs/${app.jobId}`}
                      className="text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-muted hover:text-navy transition-colors hidden sm:flex items-center gap-1">
                      View <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Browse more */}
        {applications.length > 0 && (
          <div className="mt-6 text-center">
            <Link href="/jobs"
              className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-navy hover:text-brass transition-colors underline underline-offset-4">
              Browse More Opportunities →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
