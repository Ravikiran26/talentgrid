"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bookmark, X } from "lucide-react";
import { getUser } from "@/lib/auth";
import { fetchSavedJobs, unsaveJob } from "@/lib/savedJobs";
import type { Job } from "@/types";
import JobCard from "@/components/jobs/JobCard";

export default function SavedJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "CANDIDATE") { router.push("/"); return; }
    fetchSavedJobs().then(setJobs).finally(() => setLoading(false));
  }, [router]);

  async function handleRemove(jobId: string) {
    const prev = jobs;
    setJobs((j) => j.filter((x) => x.id !== jobId));
    try { await unsaveJob(jobId); } catch { setJobs(prev); }
  }

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-screen-lg mx-auto px-6 lg:px-10 py-8">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-1">
            My Dashboard
          </p>
          <h1 className="font-serif text-3xl font-bold text-surface">Saved Jobs</h1>
          <p className="text-[15px] font-sans text-navy-text mt-1">
            {jobs.length} {jobs.length === 1 ? "role" : "roles"} saved
          </p>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-6 lg:px-10 py-8">
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-[15px] font-sans text-muted">Loading your saved jobs…</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-20 text-center bg-surface border border-border">
            <Bookmark className="w-8 h-8 text-muted mx-auto mb-3" />
            <p className="text-[15px] font-sans text-muted font-medium">You haven&apos;t saved any roles yet.</p>
            <Link href="/jobs"
              className="mt-4 inline-block text-[13px] font-sans font-semibold uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid px-6 py-2.5 transition-colors">
              Browse Opportunities →
            </Link>
          </div>
        ) : (
          <div className="bg-surface border border-border">
            {jobs.map((job) => (
              <div key={job.id} className="relative">
                <JobCard job={job} />
                <button type="button" onClick={() => handleRemove(job.id)}
                  aria-label={`Remove ${job.title} from saved`}
                  className="absolute top-4 right-4 w-7 h-7 inline-flex items-center justify-center text-muted hover:text-red-600 border border-transparent hover:border-red-200 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
