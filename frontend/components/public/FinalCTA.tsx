import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-surface-alt border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-24">
        <div className="max-w-2xl">
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
      </div>
    </section>
  );
}
