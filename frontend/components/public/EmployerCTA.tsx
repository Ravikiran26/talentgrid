import Link from "next/link";
import type { JobStats } from "@/lib/stats";

interface Props { stats: JobStats | null }

export default function EmployerCTA({ stats }: Props) {
  const figures = [
    { value: stats ? String(stats.activeJobs) : "—", label: "Live roles on the platform" },
    { value: stats ? String(stats.companies)  : "—", label: "Organisations hiring" },
    { value: stats ? String(stats.categories) : "—", label: "Specialist disciplines" },
    { value: stats ? String(stats.cities)     : "—", label: "Cities across India" },
  ];

  return (
    <section className="bg-navy">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          <div className="lg:col-span-6">
            <div className="flex items-center gap-4 mb-7">
              <span className="w-11 h-[2px] bg-brass" />
              <span className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.24em] text-brass">
                For Employers
              </span>
            </div>
            <h2 className="font-serif text-[2.1rem] lg:text-[2.4rem] font-bold text-surface leading-[1.15] tracking-tight">
              Hire people who already<br className="hidden sm:block" /> understand the work.
            </h2>
            <p className="mt-6 text-[16px] font-sans text-navy-text leading-relaxed max-w-md">
              Connect with experienced Project Management professionals through a focused
              specialist talent network.
            </p>
            <Link href="/for-employers"
              className="mt-9 inline-flex items-center gap-3 text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-navy bg-brass hover:bg-brass-light px-8 py-4 transition-colors duration-150">
              Hire through TalentGrid <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="lg:col-span-6 lg:pl-10">
            <div className="grid grid-cols-2 gap-px bg-navy-border border border-navy-border">
              {figures.map((f) => (
                <div key={f.label} className="bg-navy px-7 py-9">
                  <p className="font-serif text-[2.3rem] font-bold text-surface leading-none tabular-nums">
                    {f.value}
                  </p>
                  <p className="mt-3 text-[13px] font-sans text-navy-text leading-snug">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
