import type { Company } from "@/types";

/**
 * DEMO DATA ONLY — deliberately fictional names.
 * The employer-trust strip shows organisations that genuinely have open roles in the
 * database. This list is the fallback shown when the API is unreachable, so it must
 * never imply a real company partners with TalentGrid.
 */
export const featuredCompanies: Company[] = [
  { id: "1", name: "Nexora",      initials: "NX" },
  { id: "2", name: "Vertexis",    initials: "VX" },
  { id: "3", name: "Cloudwell",   initials: "CW" },
  { id: "4", name: "StratEdge",   initials: "SE" },
  { id: "5", name: "PeopleWorks", initials: "PW" },
  { id: "6", name: "OrionTech",   initials: "OT" },
  { id: "7", name: "Mahika",      initials: "MK" },
];
