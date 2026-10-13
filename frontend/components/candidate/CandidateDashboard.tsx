"use client";

import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { fetchJobs } from "@/lib/jobs";
import { computeMatch } from "@/lib/match";
import { fetchSavedJobIds, toggleSavedJob } from "@/lib/savedJobs";
import { fetchJobStats, fetchSubscription, FREE_SUBSCRIPTION, type SubscriptionInfo } from "@/lib/account";
import { fetchInsightsClient, type Insight } from "@/lib/insights";
import type { Job } from "@/types";
import { type ApplicationRow, type CandidateProfile, missingProfileItems } from "./types";

import DashboardGreeting from "./DashboardGreeting";
import DashboardSearch from "./DashboardSearch";
import RecommendedJobs, { RecommendedHeader, type RecommendedJob } from "./RecommendedJobs";
import CandidateActivity from "./CandidateActivity";
import RecentApplications from "./RecentApplications";
import OpportunityCategories, { type OpportunityGroup } from "./OpportunityCategories";
import CareerInsights from "./CareerInsights";

const MIN_MATCH = 60;
const MAX_RECOMMENDED = 5;

export default function CandidateDashboard({ user }: { user: AuthUser }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CandidateProfile>({});
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(FREE_SUBSCRIPTION);
  const [weekly, setWeekly] = useState<OpportunityGroup[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  const load = useCallback(async () => {
    const [p, a, j, ids, sub, stats, ins] = await Promise.allSettled([
      api.get<CandidateProfile>("/api/profile/me"),
      api.get<ApplicationRow[]>("/api/applications/my"),
      fetchJobs({ size: 20 }),
      fetchSavedJobIds(),
      fetchSubscription(),
      fetchJobStats(),
      fetchInsightsClient(),
    ]);
    if (ins.status === "fulfilled") setInsights(ins.value);
    if (p.status === "fulfilled") setProfile(p.value);
    if (a.status === "fulfilled") setApplications(a.value);
    if (j.status === "fulfilled") setJobs(j.value);
    if (ids.status === "fulfilled") setSavedIds(ids.value);
    if (sub.status === "fulfilled") setSubscription(sub.value);
    if (stats.status === "fulfilled" && stats.value) setWeekly(stats.value.newThisWeek);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleToggleSave(jobId: string) {
    const wasSaved = savedIds.includes(jobId);
    // Optimistic update; roll back if the request fails.
    setSavedIds((ids) => (wasSaved ? ids.filter((i) => i !== jobId) : [...ids, jobId]));
    try {
      await toggleSavedJob(jobId, wasSaved);
    } catch {
      setSavedIds((ids) => (wasSaved ? [...ids, jobId] : ids.filter((i) => i !== jobId)));
    }
  }

  const skills = profile.skills ?? [];
  const appliedJobIds = new Set(applications.map((a) => String(a.jobId)));
  const scored: RecommendedJob[] = jobs
    .filter((job) => !appliedJobIds.has(String(job.id)))
    .map((job) => ({
      job,
      match: skills.length > 0 ? computeMatch(job, skills, profile.totalExp ?? null) : null,
    }))
    .sort((x, y) => (y.match?.percent ?? 0) - (x.match?.percent ?? 0));
  // Only show weak matches when there is nothing better to recommend.
  const strong = scored.filter((r) => r.match === null || r.match.percent >= MIN_MATCH);
  const recommended = (strong.length > 0 ? strong : scored).slice(0, MAX_RECOMMENDED);

  const updatedAt = (a: ApplicationRow) => new Date(a.updatedAt ?? a.appliedAt).getTime();
  const byRecentUpdate = [...applications].sort((x, y) => updatedAt(y) - updatedAt(x));
  const byApplied = [...applications].sort(
    (x, y) => new Date(y.appliedAt).getTime() - new Date(x.appliedAt).getTime(),
  );
  const counts = {
    applications: applications.length,
    underReview:  applications.filter((a) => a.status === "UNDER_REVIEW").length,
    shortlisted:  applications.filter((a) => a.status === "SHORTLISTED").length,
    saved:        savedIds.length,
  };
  const strength = profile.profileStrength ?? 0;
  const weeklyMatches = weekly.reduce((n, g) => n + g.count, 0);
  const active = applications.filter((a) => a.status !== "REJECTED").length;
  const summary = active > 0
    ? `You have ${active} active ${active === 1 ? "application" : "applications"}${counts.shortlisted > 0 ? `, ${counts.shortlisted} shortlisted` : ""}.`
    : "Find your next senior role.";

  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-[1320px] mx-auto px-5 lg:px-8 py-6 lg:py-7 space-y-7">
        <DashboardGreeting
          firstName={user.fullName.split(" ")[0]}
          summary={summary}
          weeklyMatches={weeklyMatches}
          strength={strength}
          missing={missingProfileItems(profile)}
          shortlisted={byRecentUpdate.find((a) => a.status === "SHORTLISTED") ?? null}
        />

        <DashboardSearch skills={skills} />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-x-6 gap-y-4 items-start">
          <RecommendedHeader className="lg:col-span-2" />
          <RecommendedJobs items={recommended} loading={loading} savedIds={savedIds} onToggleSave={handleToggleSave} />
          <CandidateActivity
            counts={counts}
            latest={byRecentUpdate[0] ?? null}
            subscription={subscription}
          />
        </div>

        <RecentApplications applications={byApplied} />
        <OpportunityCategories groups={weekly} />
        <CareerInsights articles={insights} />
      </div>
    </div>
  );
}
