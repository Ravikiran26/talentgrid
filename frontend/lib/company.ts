import { api } from "./api";
import { normalizeJob } from "./jobs";
import type { Job } from "@/types";

export interface CompanyProfile {
  id: number;
  name: string;
  logoInitials: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  city: string | null;
  description: string | null;
  createdAt: string;
  openJobs: number;
  jobs: Job[];
}

export interface CompanyForm {
  name: string; website: string; industry: string; size: string; city: string; description: string;
}

function normalize(raw: Record<string, unknown>): CompanyProfile {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ""),
    logoInitials: raw.logoInitials != null ? String(raw.logoInitials) : null,
    website: raw.website != null ? String(raw.website) : null,
    industry: raw.industry != null ? String(raw.industry) : null,
    size: raw.size != null ? String(raw.size) : null,
    city: raw.city != null ? String(raw.city) : null,
    description: raw.description != null ? String(raw.description) : null,
    createdAt: String(raw.createdAt ?? ""),
    openJobs: Number(raw.openJobs ?? 0),
    jobs: Array.isArray(raw.jobs) ? (raw.jobs as Record<string, unknown>[]).map(normalizeJob) : [],
  };
}

/** Employer's own profile, or null before it is created. */
export async function fetchMyCompany(): Promise<CompanyProfile | null> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const token = typeof window !== "undefined" ? localStorage.getItem("tg_token") : null;
  const res = await fetch(`${API_URL}/api/employer/company`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`${res.status}`);
  return normalize((await res.json()) as Record<string, unknown>);
}

export async function saveMyCompany(form: CompanyForm): Promise<CompanyProfile> {
  const raw = await api.put<Record<string, unknown>>("/api/employer/company", form);
  return normalize(raw);
}

/** Public company page (RSC). Null on 404. */
export async function fetchCompany(id: string): Promise<CompanyProfile | null> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  try {
    const res = await fetch(`${API_URL}/api/companies/${encodeURIComponent(id)}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return normalize((await res.json()) as Record<string, unknown>);
  } catch {
    return null;
  }
}
