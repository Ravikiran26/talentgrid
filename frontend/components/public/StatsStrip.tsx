import type { JobStats } from "@/lib/stats";

interface Props { stats: JobStats | null }

/**
 * Full-width platform figures on a single ivory ground, below the hero.
 * `activeJobs`, `companies` and `cities` come from /api/jobs/stats; the pre-screened
 * figure is a policy statement, not a metric. Dashes render when the API is
 * unreachable rather than inventing numbers.
 */
export default function StatsStrip({ stats }: Props) {
  const items = [
    { value: stats ? String(stats.activeJobs) : "—", label: "Open Positions" },
    { value: stats ? String(stats.companies)  : "—", label: "Hiring Organisations" },
    { value: "100%",                                 label: "Pre-screened Opportunities" },
    { value: stats ? String(stats.cities)     : "—", label: "Cities Across India" },
  ];

  return (
    <section className="bg-ivory border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 lg:py-9">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {items.map((s, i) => (
            <div key={s.label}
              className={`px-5 lg:px-8 py-5 md:py-0 text-center
                ${i % 2 === 1 ? "border-l border-border" : ""}
                ${i >= 2 ? "border-t border-border md:border-t-0" : ""}
                ${i >= 1 ? "md:border-l md:border-border" : ""}`}>
              <p className="font-serif text-[2.1rem] lg:text-[2.45rem] font-bold text-navy leading-none tabular-nums">
                {s.value}
              </p>
              <p className="mt-3 text-[13.5px] font-sans text-muted leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
