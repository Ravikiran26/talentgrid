"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getUser } from "@/lib/auth";
import { api, ApiError } from "@/lib/api";
import { formatSalary, formatExperience } from "@/lib/utils";
import type { Job } from "@/types";

type ApplyState = "idle" | "loading" | "success" | "already" | "error";

export default function ApplyCard({ job }: { job: Job }) {
  const [user,     setUser]     = useState<ReturnType<typeof getUser>>(null);
  const [state,    setState]    = useState<ApplyState>("idle");
  const [canApply, setCanApply] = useState<boolean | null>(null);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(u);
    if (u?.role === "CANDIDATE") {
      api.get<{ canApply: boolean }>("/api/profile/me")
        .then((p) => setCanApply(p.canApply))
        .catch(() => setCanApply(false));
    }
  }, []);

  async function handleApply() {
    setState("loading");
    try {
      await api.post("/api/applications", { jobId: job.id });
      setState("success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setState("already");
      } else {
        setState("error");
      }
    }
  }

  const meta = [
    { l: "Employment",  v: job.employmentType },
    ...(job.openings != null ? [{ l: "Openings", v: `${job.openings} open` }] : []),
    { l: "Posted",      v: job.postedAt },
    { l: "Location",    v: job.location },
    { l: "Experience",  v: formatExperience(job.experienceMin, job.experienceMax) },
    { l: "Salary",      v: formatSalary(job.salaryMin, job.salaryMax) },
  ];

  return (
    <div className="border border-border bg-surface">
      <div className="bg-navy px-5 py-5 border-b border-navy-border">
        <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.24em] text-brass mb-1">
          Apply for this Role
        </p>
        <p className="font-serif text-[1.05rem] font-semibold text-surface leading-snug">{job.title}</p>
        <p className="text-[12px] font-sans text-[#8A9DB5] mt-0.5">{job.company}</p>
      </div>

      <div className="p-5">
        {/* Apply button area */}
        {!mounted ? (
          <div className="h-[46px] bg-border/30 animate-pulse" />
        ) : state === "success" ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <p className="text-[12px] font-sans font-semibold text-green-700">Application Submitted!</p>
            <Link href="/dashboard"
              className="text-[11px] font-sans text-navy underline underline-offset-4 hover:text-brass transition-colors">
              View your applications →
            </Link>
          </div>
        ) : state === "already" ? (
          <div className="text-center py-3">
            <p className="text-[12px] font-sans font-semibold text-amber-600">Already Applied</p>
            <Link href="/dashboard"
              className="text-[11px] font-sans text-navy underline underline-offset-4 hover:text-brass transition-colors mt-1 block">
              Track your application →
            </Link>
          </div>
        ) : user?.role === "CANDIDATE" ? (
          canApply === null ? (
            <div className="h-[46px] bg-border/30 animate-pulse" />
          ) : canApply ? (
            <>
              <button
                type="button"
                onClick={handleApply}
                disabled={state === "loading"}
                className="block w-full py-3.5 text-center text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-surface bg-navy hover:bg-navy-mid disabled:opacity-60 active:bg-charcoal transition-colors duration-150 focus:outline-none"
              >
                {state === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…
                  </span>
                ) : "Apply Now →"}
              </button>
              {state === "error" && (
                <p className="mt-2 text-[11px] font-sans text-red-500 text-center">
                  Something went wrong. Please try again.
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-1">
              <p className="text-[12px] font-sans font-semibold text-amber-700 mb-2">
                Complete your profile to apply
              </p>
              <p className="text-[11px] font-sans text-muted mb-3">
                Add a headline, at least one skill, and upload your resume.
              </p>
              <Link href="/profile"
                className="block w-full py-3 text-center text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-navy border border-navy hover:bg-navy hover:text-surface transition-colors">
                Complete Profile →
              </Link>
            </div>
          )
        ) : (
          <>
            <Link
              href="/login"
              className="block w-full py-3.5 text-center text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-surface bg-navy hover:bg-navy-mid transition-colors duration-150">
              Sign In to Apply →
            </Link>
            <p className="mt-2.5 text-[11px] font-sans text-muted text-center">
              <Link href="/register" className="underline underline-offset-4 hover:text-charcoal">Create a free profile</Link> to apply
            </p>
          </>
        )}

        {/* Job meta */}
        <div className="mt-5 pt-5 border-t border-border space-y-3">
          {meta.map(({ l, v }) => (
            <div key={l} className="flex items-start justify-between gap-3">
              <span className="text-[11px] font-sans text-muted flex-shrink-0">{l}</span>
              <span className="text-[11px] font-sans font-medium text-charcoal text-right">{v}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-muted mb-2.5">
            Skills Required
          </p>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((s) => (
              <span key={s} className="text-[10px] font-sans text-muted border border-border px-2.5 py-0.5">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
