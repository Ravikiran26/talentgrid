import Link from "next/link";

const DISCIPLINES = [
  { n: "01", title: "Project Management", body: "Delivery ownership across scope, budget and schedule.",       q: "Project Manager" },
  { n: "02", title: "PMO",                body: "Governance, portfolio reporting and delivery standards.",      q: "PMO" },
  { n: "03", title: "Program Management", body: "Multi-project programmes and cross-team dependencies.",        q: "Program Manager" },
  { n: "04", title: "Scrum & Agile",      body: "Scrum Masters, RTEs and agile delivery leadership.",           q: "Scrum Master" },
  { n: "05", title: "Portfolio Management", body: "Investment decisions and benefits realisation at scale.",    q: "Portfolio" },
  { n: "06", title: "Transformation",     body: "Change programmes, operating models and modernisation.",       q: "Transformation" },
];

export default function SpecialistDisciplines() {
  return (
    <section className="bg-surface-alt border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">

        <div className="flex items-center gap-4 mb-7">
          <span className="w-11 h-[2px] bg-brass" />
          <span className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.24em] text-muted">
            Specialist Disciplines
          </span>
        </div>
        <h2 className="font-serif text-[2.1rem] font-bold text-navy leading-tight tracking-tight max-w-2xl">
          One domain, covered properly
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 border-t border-border">
          {DISCIPLINES.map((d) => (
            <Link key={d.n} href={`/jobs?q=${encodeURIComponent(d.q)}`}
              className="group flex items-start gap-6 py-8 border-b border-border">
              <span className="font-serif text-[1.1rem] font-bold text-brass leading-none pt-1.5 select-none">
                {d.n}
              </span>
              <span className="flex-1">
                <span className="block text-[17px] font-sans font-semibold text-navy group-hover:text-brass transition-colors">
                  {d.title}
                </span>
                <span className="block mt-2 text-[14.5px] font-sans text-muted leading-relaxed">
                  {d.body}
                </span>
              </span>
              <span aria-hidden
                className="text-muted group-hover:text-brass group-hover:translate-x-1 transition-all duration-200 pt-1">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
