/** Server-side (RSC) fetchers for public aggregate numbers. Both fail soft. */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface JobStats {
  activeJobs: number;
  companies: number;
  cities: number;
  categories: number;
  newThisWeek: { label: string; count: number }[];
}

export interface Facet { value: string; count: number }
export interface JobFacets { categories: Facet[]; locations: Facet[]; companies: Facet[] }

export async function fetchJobStatsServer(): Promise<JobStats | null> {
  try {
    const res = await fetch(`${API_URL}/api/jobs/stats`, { next: { revalidate: 60 } });
    return res.ok ? ((await res.json()) as JobStats) : null;
  } catch {
    return null;
  }
}

export async function fetchJobFacetsServer(): Promise<JobFacets | null> {
  try {
    const res = await fetch(`${API_URL}/api/jobs/facets`, { next: { revalidate: 60 } });
    return res.ok ? ((await res.json()) as JobFacets) : null;
  } catch {
    return null;
  }
}
