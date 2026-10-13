"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { normalizeJob } from "@/lib/jobs";
import ApplicantReview, {
  toApplicant, type Applicant, type ApplicantDto, type ReviewStatus,
} from "@/components/recruiter/ApplicantReview";
import type { Job } from "@/types";

export default function AdminJobApplicantsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [rows, setRows] = useState<Applicant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [j, a] = await Promise.all([
        api.get<Record<string, unknown>>(`/api/jobs/${id}`),
        api.get<ApplicantDto[]>(`/api/admin/jobs/${id}/applications?size=100`),
      ]);
      setJob(normalizeJob(j));
      setRows(a.map(toApplicant));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load applicants.");
    }
  }, [id]);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "ADMIN") { router.push("/"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [router, load]);

  async function setStatus(appId: number, status: ReviewStatus) {
    await api.patch(`/api/admin/applications/${appId}/status`, { status });
    setRows((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
  }

  if (error) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center px-6">
        <div className="bg-surface border border-border p-8 max-w-md text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-3" />
          <p className="text-[15px] font-sans text-red-600 mb-4">{error}</p>
          <Link href="/admin/jobs" className="text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass">← All jobs</Link>
        </div>
      </div>
    );
  }
  if (!job) return <div className="min-h-screen bg-ivory" aria-busy="true" />;

  return (
    <ApplicantReview
      job={job}
      applicants={rows}
      backHref="/admin/jobs"
      backLabel="All jobs"
      photoPath={(a) => `/api/admin/candidates/${a.candidateId}/photo`}
      resumePath={(a) => `/api/admin/candidates/${a.candidateId}/resume`}
      onStatusChange={setStatus}
    />
  );
}
