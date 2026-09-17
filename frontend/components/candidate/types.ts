export interface ApplicationRow {
  id: string | number;
  jobId: string | number;
  jobTitle: string;
  company: string;
  location: string;
  status: string;
  appliedAt: string;
}

export interface CandidateProfile {
  headline?: string;
  city?: string;
  totalExp?: number;
  skills?: string[];
  profileStrength?: number;
  canApply?: boolean;
  hasResume?: boolean;
}

export function missingProfileItems(p: CandidateProfile): string[] {
  const missing: string[] = [];
  if (!p.hasResume) missing.push("Resume");
  if (!p.skills || p.skills.length === 0) missing.push("Skills");
  if (!p.headline) missing.push("Headline");
  if (!p.city) missing.push("Location");
  if (p.totalExp == null) missing.push("Experience");
  return missing;
}
