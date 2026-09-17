/**
 * Asymmetric editorial hero: copy on the left, executive-office photograph on the right.
 *
 * The photo panel is bounded by this section only. Search, statistics and the employer
 * strip are sibling sections below, so nothing ever sits over the photograph.
 */
export default function HeroSection() {
  return (
    <section className="relative bg-ivory overflow-hidden">

      {/* Right-hand photograph. Near-vertical split with a slight angled edge. */}
      <div aria-hidden className="hidden lg:block absolute inset-y-0 right-0 w-[41%]"
        style={{ clipPath: "polygon(5% 0, 100% 0, 100% 100%, 0 100%)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero.jpg" alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "34% center" }} />

        {/* Keeps the skyline and desk readable while deepening behind the quote. */}
        <div className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(7,24,39,0.06) 0%, rgba(7,24,39,0.22) 45%, rgba(7,24,39,0.72) 100%)",
          }} />

        {/* Feathered join into the ivory column so the edge is not a hard line. */}
        <div className="absolute inset-y-0 left-0 w-[12%]"
          style={{ background: "linear-gradient(90deg, var(--color-ivory) 0%, rgba(247,243,235,0) 100%)" }} />
      </div>

      {/* Editorial quote overlay */}
      <div className="hidden lg:block absolute top-[11%] right-[3%] w-[252px] z-10">
        <div className="bg-navy-deep/85 border border-navy-border px-7 py-7">
          <div className="w-8 h-[2px] bg-brass mb-5" />
          <p className="font-serif text-[1.28rem] italic text-surface leading-[1.36]">
            &ldquo;Great projects build businesses. Great people deliver them.&rdquo;
          </p>
          <div className="mt-6 pt-5 border-t border-navy-border">
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.26em] text-navy-text-light">
              TalentGrid
            </p>
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mt-1.5">
              Executive Careers
            </p>
          </div>
        </div>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="pt-12 lg:pt-14 pb-10 lg:pb-12">

          <div className="lg:max-w-[52%]">
            <div className="flex items-center gap-4 mb-7">
              <span className="w-11 h-[2px] bg-brass" />
              <span className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.24em] text-muted">
                Project Management Careers · India
              </span>
            </div>

            {/* Width is capped so the three-line break is the one that renders. */}
            <h1 className="font-serif text-[2.25rem] sm:text-[2.6rem] lg:text-[2.95rem] font-bold text-navy leading-[1.12] tracking-[-0.015em] max-w-[15ch]">
              Where Project Management Talent Meets Real Opportunities
            </h1>

            <p className="mt-6 text-[16px] font-sans text-muted leading-[1.65] max-w-[46ch]">
              A specialist platform for Project Management, PMO, Agile and Leadership roles.
              Curated opportunities. Trusted employers. Meaningful careers.
            </p>
          </div>

          {/* Stacked visual for tablet and phone, where the side panel is hidden */}
          <div className="lg:hidden mt-10 relative h-[200px] border border-border overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "38% center" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(100deg, rgba(7,24,39,0.18) 0%, rgba(7,24,39,0.52) 42%, rgba(7,24,39,0.82) 100%)" }} />
            <div className="absolute inset-0 flex flex-col justify-center px-7">
              <div className="w-8 h-[2px] bg-brass mb-4" />
              <p className="font-serif text-[1.15rem] italic text-surface leading-snug max-w-[250px]">
                &ldquo;Great projects build businesses. Great people deliver them.&rdquo;
              </p>
              <p className="mt-4 text-[9.5px] font-sans font-semibold uppercase tracking-[0.24em] text-brass">
                TalentGrid · Executive Careers
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
