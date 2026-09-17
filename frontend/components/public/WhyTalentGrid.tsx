import { Compass, Building2, Target, TrendingUp } from "lucide-react";

const REASONS = [
  { icon: Compass,    title: "Specialist Focus",  body: "Only Project Management and related leadership roles." },
  { icon: Building2,  title: "Curated Employers", body: "Work with relevant, quality organisations." },
  { icon: Target,     title: "Smarter Matching",  body: "Relevant opportunities based on experience and profile." },
  { icon: TrendingUp, title: "Career Growth",     body: "Insights, resources and long-term career opportunities." },
];

export default function WhyTalentGrid() {
  return (
    <section className="bg-surface border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-18 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-7">
              <span className="w-11 h-[2px] bg-brass" />
              <span className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.24em] text-muted">
                Why TalentGrid
              </span>
            </div>
            <h2 className="font-serif text-[2.1rem] lg:text-[2.35rem] font-bold text-navy leading-[1.16] tracking-tight">
              A more considered<br className="hidden sm:block" /> approach to recruitment
            </h2>
            <p className="mt-6 text-[16px] font-sans text-muted leading-relaxed max-w-md">
              TalentGrid is designed around one specialist talent community rather than
              trying to serve every profession.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-11">
            {REASONS.map((r) => (
              <div key={r.title}>
                <r.icon className="w-[26px] h-[26px] text-brass" strokeWidth={1.25} />
                <h3 className="mt-5 text-[16.5px] font-sans font-semibold text-navy">{r.title}</h3>
                <p className="mt-2.5 text-[14.5px] font-sans text-muted leading-relaxed max-w-xs">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
