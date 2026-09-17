import type { JobCategory } from "@/types";

export const jobCategories: JobCategory[] = [
  {
    id: "1",
    name: "Coordinator & Analyst",
    description:
      "Entry to mid-level project management roles — Project Coordinator, AI Project Coordinator, Junior Scrum Master, PM Analyst, IT Project Coordinator, and Release Coordinator.",
    jobCount: 0,
    slug: "coordinator",
    includes: ["coordinator", "analyst"],
  },
  {
    id: "2",
    name: "Manager & Lead",
    description:
      "Senior project management roles — Project Manager, AI Project Manager, Scrum Master, IT Program Manager, PMO Lead, Program Manager, and Cloud Project Manager.",
    jobCount: 0,
    slug: "manager",
    includes: ["manager", "pmo", "scrum-master", "consultant", "director"],
  },
];
