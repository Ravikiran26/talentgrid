"use client";

import { useEffect, useState } from "react";
import { fetchJobStats, type JobStats } from "@/lib/account";

type Key = "activeJobs" | "companies" | "cities";
interface Props {
  items: { key: Key; label: string }[];
  /** Tailwind classes for the number and label, so the strip fits light and dark cards. */
  numberClass?: string;
  labelClass?: string;
  dividerClass?: string;
}

/** Live counts from /api/jobs/stats for auth-page side cards. Renders a dash until loaded. */
export default function StatStrip({
  items,
  numberClass = "font-serif text-[1.54rem] font-bold text-navy leading-none",
  labelClass = "text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-brass mt-1.5",
  dividerClass = "border-r border-border pr-4 mr-4",
}: Props) {
  const [stats, setStats] = useState<JobStats | null>(null);
  useEffect(() => { fetchJobStats().then(setStats); }, []);
  return (
    <div className="flex items-center">
      {items.map((it, i) => (
        <div key={it.key} className={`flex-1 ${i < items.length - 1 ? dividerClass : ""}`}>
          <p className={numberClass} aria-busy={!stats}>{stats ? stats[it.key] : "–"}</p>
          <p className={labelClass}>{it.label}</p>
        </div>
      ))}
    </div>
  );
}
