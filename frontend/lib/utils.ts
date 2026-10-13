export function formatRelativeDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** For mid-sentence use ("Updated today", "Applied 17 Sept 2026"): lower-cases only the relative words. */
export function formatRelativeDateInline(iso: string): string {
  const r = formatRelativeDate(iso);
  return /^(Today|Yesterday|\d+ days ago)$/.test(r) ? r.toLowerCase() : r;
}

/** "Apr 2021" from an ISO date such as "2021-04-01"; empty when missing or invalid. */
export function formatMonthYear(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return "Salary not disclosed";
  if (min && max) return `₹${min}–${max} LPA`;
  if (min) return `₹${min}+ LPA`;
  return `Up to ₹${max} LPA`;
}

export function formatExperience(min: number, max?: number | null): string {
  if (min === 0 && (max === 0 || max == null)) return "Fresher";
  // `max` treated as unbounded when undefined/null, or when it's 0 but there's a real min
  if (max == null || (max === 0 && min > 0)) return `${min}+ Years`;
  if (min === max) return `${min} Years`;
  return `${min}–${max} Years`;
}
