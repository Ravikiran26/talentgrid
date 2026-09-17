import type { Job } from "@/types";

export interface MatchResult {
  percent: number;
  matched: string[];
  missing: string[];
}

/**
 * Client-side match heuristic derived from real profile + job data
 * (skill overlap + experience fit). Pending a backend matching endpoint,
 * this stands in as the "matching intelligence" signal — not random.
 */
export function computeMatch(
  job: Job,
  candidateSkills: string[],
  candidateExpYears: number | null,
): MatchResult {
  const norm = (s: string) => s.toLowerCase().trim();
  const candidateSet = new Set(candidateSkills.map(norm));
  const jobSkills = job.skills ?? [];

  const matched = jobSkills.filter((s) => candidateSet.has(norm(s)));
  const missing = jobSkills.filter((s) => !candidateSet.has(norm(s)));

  // Matching the first few listed skills is what matters; long skill lists shouldn't punish candidates.
  const denominator = Math.min(Math.max(jobSkills.length, 1), 4);
  const skillScore = Math.min(1, matched.length / denominator);

  let expScore = 0.6;
  if (candidateExpYears != null) {
    const min = job.experienceMin ?? 0;
    const max = job.experienceMax ?? min + 4;
    const distance = candidateExpYears < min ? min - candidateExpYears : Math.max(0, candidateExpYears - max);
    expScore = distance <= 1 ? 1 : Math.max(0.3, 1 - (distance - 1) * 0.1);
  }

  const percent = Math.round((skillScore * 0.7 + expScore * 0.3) * 100);
  return { percent: Math.min(98, Math.max(30, percent)), matched, missing: missing.slice(0, 3) };
}
