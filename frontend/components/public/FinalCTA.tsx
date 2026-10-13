import Link from "next/link";

const STEPS = [
  { n: "01", title: "Create your profile", body: "Your experience, certifications and the roles you want next." },
  { n: "02", title: "See relevant roles", body: "Opportunities matched to your experience and discipline." },
  { n: "03", title: "Apply and track", body: "Follow every application from submission to decision." },
];

/** Closing call to action: headline and actions on the left, how it works on the right. */
export default function FinalCTA() {
  return (
    <section className="bg-surface-alt border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center">
        <div className="lg:col-span-7">
          <div className="w-11 h-[2px] bg-brass mb-8" />
          <h2 className="font-serif text-[2.2rem] lg:text-[2.6rem] font-bold text-navy leading-[1.16] tracking-tight">
            The right opportunity should<br className="hidden sm:block" /> move your career forward.
          </h2>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/jobs"
              className="inline-flex items-center justify-center text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid px-9 py-4 transition-colors duration-150">
              Explore Opportunities
            </Link>
            <Link href="/register"
              className="inline-flex items-center justify-center text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-navy border border-navy hover:bg-navy hover:text-surface px-9 py-4 transition-colors duration-150">
              Create Your Profile
            </Link>
          </div>
        </div>

        <ol className="lg:col-span-5 border-t border-border">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-5 py-6 border-b border-border">
              <span className="w-7 flex-shrink-0 font-serif text-[1.15rem] font-bold text-brass leading-none pt-0.5">{s.n}</span>
              <div>
                <p className="font-sans text-[15.5px] font-semibold text-navy">{s.title}</p>
                <p className="mt-1.5 font-sans text-[14px] text-muted leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
