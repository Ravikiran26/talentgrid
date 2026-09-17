import { api } from "./api";

export interface Insight {
  id: number;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  body: string | null;   // only present on the detail endpoint
  published: boolean;
  publishedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Server-side list (RSC). Fails soft with []. */
export async function fetchInsights(): Promise<Insight[]> {
  try {
    const res = await fetch(`${API_URL}/api/insights`, { next: { revalidate: 60 } });
    return res.ok ? ((await res.json()) as Insight[]) : [];
  } catch {
    return [];
  }
}

/** Server-side detail (RSC). Null on 404. */
export async function fetchInsight(slug: string): Promise<Insight | null> {
  try {
    const res = await fetch(`${API_URL}/api/insights/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    return res.ok ? ((await res.json()) as Insight) : null;
  } catch {
    return null;
  }
}

/** Client-side list for the dashboard. */
export async function fetchInsightsClient(): Promise<Insight[]> {
  try { return await api.get<Insight[]>("/api/insights"); } catch { return []; }
}

export function formatPublished(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Body is plain text: blank-line paragraphs, lines starting with "## " are headings. */
export function splitBody(body: string): { type: "h2" | "p"; text: string }[] {
  return body.split(/\n\s*\n/).map((block) => {
    const t = block.trim();
    return t.startsWith("## ")
      ? { type: "h2" as const, text: t.slice(3).trim() }
      : { type: "p" as const, text: t };
  }).filter((b) => b.text.length > 0);
}
