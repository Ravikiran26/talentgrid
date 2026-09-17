"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Briefcase, Building2, Check, Clock, X, AlertCircle, FileText,
} from "lucide-react";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { normalizeJob } from "@/lib/jobs";
import { formatSalary, formatExperience, formatRelativeDate } from "@/lib/utils";
import ApplicationStatusBadge from "@/components/candidate/ApplicationStatusBadge";
import type { Job } from "@/types";

type Status = "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "REJECTED";

interface Stage { status: Status; note: string | null; changedAt: string }
interface Detail {
  id: number; status: Status; appliedAt: string; coverLetter: string | null;
  job: Record<string, unknown>; companyId: number | null; timeline: Stage[];
}

/** The happy path every application walks. Rejection replaces whatever step comes next. */
const TRACK: { status: Status; title: string; blurb: string }[] = [
  { status: "APPLIED",      title: "Applied",       blurb: "Your profile and resume reached the hiring team." },
  { status: "UNDER_REVIEW", title: "Under review",  blurb: "A recruiter is assessing your fit for the role." },
  { status: "SHORTLISTED",  title: "Shortlisted",   blurb: "You are through to the interview stage." },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<Detail | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<Detail>(`/api/applications/${id}`);
      setD(data);
      setJob(normalizeJob(data.job));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load this application.");
    }
  }, [id]);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "CANDIDATE") { router.push("/"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [router, load]);

  if (error) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center px-6">
        <div className="bg-surface border border-border p-8 max-w-md text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-3" />
          <p className="text-[15px] font-sans text-red-600 mb-4">{error}</p>
          <Link href="/applications" className="text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass">← My applications</Link>
        </div>
      </div>
    );
  }
  if (!d || !job) return <div className="min-h-screen bg-ivory" aria-busy="true" />;

  const rejected = d.status === "REJECTED";
  const reachedIndex = rejected
    ? TRACK.findIndex((s) => s.status === "UNDER_REVIEW")
    : TRACK.findIndex((s) => s.status === d.status);
  const stageDate = (s: Status) => d.timeline.find((t) => t.status === s)?.changedAt ?? null;
  const rejection = d.timeline.find((t) => t.status === "REJECTED");

  return (
    <div className="bg-ivory min-h-screen">
      {/* Header */}
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8">
          <Link href="/applications" className="inline-flex items-center gap-2 text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-navy-text hover:text-brass transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> My applications
          </Link>
          <div className="mt-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.24em] text-brass">{job.category}</p>
              <h1 className="mt-1 font-serif text-3xl font-bold text-surface leading-tight">{job.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-sans text-navy-text-light">
                <span className="inline-flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brass" />
                  {d.companyId
                    ? <Link href={`/companies/${d.companyId}`} className="hover:text-brass transition-colors">{job.company}</Link>
                    : job.company}
                </span>
                <span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-brass" />{job.location}</span>
                <span className="inline-flex items-center gap-2"><Briefcase className="w-4 h-4 text-brass" />{formatExperience(job.experienceMin, job.experienceMax)}</span>
                <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
              </div>
            </div>
            <ApplicationStatusBadge status={d.status} />
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8 space-y-6">

        {/* Tracker */}
        <section className="bg-surface border border-border p-7">
          <h2 className="text-[12px] font-sans font-semibold uppercase tracking-[0.22em] text-muted mb-7">Application progress</h2>

          {/* Horizontal on desktop, vertical on mobile */}
          <ol className="hidden sm:grid grid-cols-3 gap-0">
            {TRACK.map((step, i) => {
              const done = i <= reachedIndex && !(rejected && step.status === "SHORTLISTED");
              const isRejectionSlot = rejected && step.status === "SHORTLISTED";
              const date = isRejectionSlot ? rejection?.changedAt ?? null : stageDate(step.status);
              return (
                <li key={step.status} className="relative pr-4">
                  {i < TRACK.length - 1 && (
                    <span aria-hidden className={`absolute left-[18px] top-[18px] h-[2px] w-[calc(100%-18px)] ${i < reachedIndex && !rejected ? "bg-brass" : i < reachedIndex ? "bg-brass" : "bg-border"}`} />
                  )}
                  <span className={`relative z-10 flex w-9 h-9 rounded-full items-center justify-center border-2 ${
                    isRejectionSlot ? "bg-red-50 border-red-300 text-red-600"
                      : done ? "bg-brass border-brass text-surface"
                      : "bg-surface border-border text-muted"}`}>
                    {isRejectionSlot ? <X className="w-4 h-4" /> : done ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </span>
                  <p className={`mt-3 text-[15px] font-sans font-semibold ${isRejectionSlot ? "text-red-600" : done ? "text-navy" : "text-muted"}`}>
                    {isRejectionSlot ? "Not selected" : step.title}
                  </p>
                  <p className="mt-1 text-[13.5px] font-sans text-muted leading-relaxed pr-2">
                    {isRejectionSlot ? "The hiring team decided not to move forward." : step.blurb}
                  </p>
                  <p className="mt-2 text-[12.5px] font-sans text-muted/80">
                    {date ? fmtDate(date) : "Pending"}
                  </p>
                </li>
              );
            })}
          </ol>

          <ol className="sm:hidden space-y-5">
            {TRACK.map((step, i) => {
              const done = i <= reachedIndex && !(rejected && step.status === "SHORTLISTED");
              const isRejectionSlot = rejected && step.status === "SHORTLISTED";
              const date = isRejectionSlot ? rejection?.changedAt ?? null : stageDate(step.status);
              return (
                <li key={step.status} className="flex gap-4">
                  <span className={`flex w-9 h-9 rounded-full items-center justify-center border-2 flex-shrink-0 ${
                    isRejectionSlot ? "bg-red-50 border-red-300 text-red-600"
                      : done ? "bg-brass border-brass text-surface"
                      : "bg-surface border-border text-muted"}`}>
                    {isRejectionSlot ? <X className="w-4 h-4" /> : done ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </span>
                  <div>
                    <p className={`text-[15px] font-sans font-semibold ${isRejectionSlot ? "text-red-600" : done ? "text-navy" : "text-muted"}`}>
                      {isRejectionSlot ? "Not selected" : step.title}
                    </p>
                    <p className="mt-0.5 text-[13.5px] font-sans text-muted">{isRejectionSlot ? "The hiring team decided not to move forward." : step.blurb}</p>
                    <p className="mt-1 text-[12.5px] font-sans text-muted/80">{date ? fmtDate(date) : "Pending"}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <div className="space-y-6">
            {/* History */}
            <section className="bg-surface border border-border p-7">
              <h2 className="text-[12px] font-sans font-semibold uppercase tracking-[0.22em] text-muted mb-5">Activity</h2>
              <ol className="space-y-5">
                {[...d.timeline].reverse().map((t, i) => (
                  <li key={i} className="relative pl-6 border-l-2 border-border">
                    <span className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${t.status === "REJECTED" ? "bg-red-400" : "bg-brass"}`} />
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <ApplicationStatusBadge status={t.status} />
                      <span className="text-[12.5px] font-sans text-muted">{fmtDate(t.changedAt)} · {formatRelativeDate(t.changedAt).toLowerCase()}</span>
                    </div>
                    {t.note && <p className="mt-2 text-[14px] font-sans text-charcoal">{t.note}</p>}
                  </li>
                ))}
              </ol>
            </section>

            {/* The role */}
            <section className="bg-surface border border-border p-7">
              <h2 className="text-[12px] font-sans font-semibold uppercase tracking-[0.22em] text-muted mb-4">About the role</h2>
              {job.description && <p className="text-[15px] font-sans text-charcoal leading-relaxed">{job.description}</p>}
              {job.skills.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span key={s} className="text-[13px] font-sans text-muted border border-border px-2.5 py-1">{s}</span>
                  ))}
                </div>
              )}
              <Link href={`/jobs/${job.id}`} className="mt-6 inline-block text-[12px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass transition-colors">
                View full job description →
              </Link>
            </section>

            {d.coverLetter && (
              <section className="bg-surface border border-border p-7">
                <h2 className="text-[12px] font-sans font-semibold uppercase tracking-[0.22em] text-muted mb-3">Your cover note</h2>
                <p className="text-[15px] font-sans text-charcoal leading-relaxed">{d.coverLetter}</p>
              </section>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-[84px]">
            <div className="bg-surface border border-border p-6">
              <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.22em] text-muted">Applied on</p>
              <p className="mt-2 font-serif text-2xl font-bold text-navy leading-none">{fmtDate(d.appliedAt)}</p>
              <p className="mt-2 text-[13.5px] font-sans text-muted">{formatRelativeDate(d.appliedAt)}</p>
            </div>
            <div className="bg-surface border border-border p-6">
              <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.22em] text-muted mb-3">What happens next</p>
              <p className="text-[14px] font-sans text-muted leading-relaxed">
                {d.status === "APPLIED" && "The hiring team has your application. You will be notified here and by e-mail when they start reviewing it."}
                {d.status === "UNDER_REVIEW" && "A recruiter is assessing your profile. Keep your resume and skills current while you wait."}
                {d.status === "SHORTLISTED" && "The hiring team will contact you directly about interview times. Check the e-mail on your profile."}
                {d.status === "REJECTED" && "This role is closed for you, but your profile stays active for every other opportunity."}
              </p>
              <Link href="/jobs" className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass transition-colors">
                <FileText className="w-3.5 h-3.5" /> Browse more roles
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
