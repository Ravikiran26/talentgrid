import type { Job } from "@/types";
import { formatRelativeDate } from "./utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function toInitials(company: string): string {
  return company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function normalizeJob(raw: Record<string, unknown>): Job {
  const company = String(raw.company ?? "");
  return {
    id:                  String(raw.id),
    title:               String(raw.title ?? ""),
    company,
    companyLogoInitials: String(raw.companyLogoInitials ?? "") || toInitials(company),
    location:            String(raw.location ?? ""),
    experienceMin:       Number(raw.experienceMin ?? 0),
    experienceMax:       raw.experienceMax != null ? Number(raw.experienceMax) : undefined,
    salaryMin:           raw.salaryMin != null ? Number(raw.salaryMin) : undefined,
    salaryMax:           raw.salaryMax != null ? Number(raw.salaryMax) : undefined,
    skills:              Array.isArray(raw.skills) ? raw.skills.map(String) : [],
    employmentType:      String(raw.employmentType ?? "Full-time"),
    postedAt:            formatRelativeDate(String(raw.postedAt ?? "")),
    category:            String(raw.category ?? ""),
    description:         raw.description != null ? String(raw.description) : undefined,
    responsibilities:    Array.isArray(raw.responsibilities) ? raw.responsibilities.map(String) : undefined,
    requirements:        Array.isArray(raw.requirements) ? raw.requirements.map(String) : undefined,
    education:           raw.education != null ? String(raw.education) : undefined,
    aboutCompany:        raw.aboutCompany != null ? String(raw.aboutCompany) : undefined,
    openings:            raw.openings != null ? Number(raw.openings) : undefined,
  };
}

/** Server-side fetch — used by RSC pages. Fails soft with []. */
export async function fetchJobs(params: {
  q?: string;
  category?: string;
  location?: string;
  page?: number;
  size?: number;
} = {}): Promise<Job[]> {
  const qs = new URLSearchParams();
  if (params.q)        qs.set("q", params.q);
  if (params.category) qs.set("category", params.category);
  if (params.location) qs.set("location", params.location);
  qs.set("page", String(params.page ?? 0));
  qs.set("size", String(params.size ?? 20));

  try {
    const res = await fetch(`${API_URL}/api/jobs?${qs.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const raw = (await res.json()) as Record<string, unknown>[];
    return raw.map(normalizeJob);
  } catch {
    return [];
  }
}

/** Server-side single-job fetch. Returns null on 404 or error. */
export async function fetchJobById(id: string): Promise<Job | null> {
  try {
    const res = await fetch(`${API_URL}/api/jobs/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as Record<string, unknown>;
    return normalizeJob(raw);
  } catch {
    return null;
  }
}
