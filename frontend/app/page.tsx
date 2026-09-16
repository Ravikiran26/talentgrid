import Link from "next/link";
import JobSearch       from "@/components/jobs/JobSearch";
import JobCard         from "@/components/jobs/JobCard";
import JobCategoryCard from "@/components/jobs/JobCategoryCard";
import { jobs as staticJobs } from "@/data/jobs";
import { jobCategories }      from "@/data/categories";
import { featuredCompanies }  from "@/data/companies";
import { fetchJobs }          from "@/lib/jobs";

/* ─────────────────────────────────────────────────────────────
   PLACEHOLDER STATS — wire to backend API in Phase 2
   ───────────────────────────────────────────────────────────── */
const STATS = [
  { value: "2",   label: "Role Levels" },
  { value: "50+", label: "Open Positions" },           // placeholder
  { value: "25+", label: "Hiring Organisations" },     // placeholder
  { value: "8",   label: "Cities Covered" },
] as const;

const WHY = [
  { num: "01", title: "Curated Opportunities",         body: "Every PM listing is reviewed before it goes live. No noise, no irrelevant roles." },
  { num: "02", title: "Pre-screened Candidates Only",  body: "We filter and assess candidates before they reach you — companies only interview people worth their time." },
  { num: "03", title: "Transparent Progress",          body: "Understand exactly where your application stands at every stage of the recruitment process." },
] as const;

export default async function HomePage() {
  const apiJobs = await fetchJobs({ size: 6 });
  const jobs = apiJobs.length > 0 ? apiJobs : staticJobs;
  const featuredJob = jobs[0];
  const latestJobs  = jobs.slice(0, 6);

  return (
    <>
      {/* ╔════════════════════════════════════════════════════
          ║  HERO
          ╚════════════════════════════════════════════════════ */}
      <section className="bg-ivory border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">

            {/* ── Left: copy ── */}
            <div className="lg:col-span-7 flex flex-col justify-center py-16 lg:py-20 lg:pr-14">
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-[2px] bg-brass" />
                <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-muted">
                  Project Management Careers · India
                </span>
              </div>

              <h1 className="font-serif text-[2.6rem] sm:text-[3.2rem] lg:text-[3.6rem] font-bold text-navy leading-[1.08] tracking-tight">
                Connecting experienced<br />
                professionals with<br />
                opportunities that matter.
              </h1>

              <p className="mt-7 text-[15px] font-sans text-muted leading-relaxed max-w-[500px]">
                TalentGrid is a specialist platform for Project Management professionals.
                We screen every candidate and deliver only the best to hiring organisations —
                no time wasted in the interview room.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/jobs"
                  className="inline-flex items-center text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-surface bg-navy hover:bg-navy-mid px-8 py-3.5 transition-colors duration-150 rounded-[3px]"
                >
                  Explore Opportunities
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-charcoal border border-border hover:border-navy hover:text-navy px-8 py-3.5 transition-colors duration-150 rounded-[3px]"
                >
                  Create Profile →
                </Link>
              </div>

              {/* Popular */}
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-[11px] font-sans text-muted">Popular:</span>
                {["Project Manager", "Scrum Master", "PMO Lead", "Program Manager", "Release Train Engineer"].map((t) => (
                  <Link key={t} href={`/jobs?q=${encodeURIComponent(t)}`}
                    className="text-[11px] font-sans text-muted hover:text-navy border-b border-transparent hover:border-navy transition-colors duration-150">
                    {t}
                  </Link>
                ))}
              </div>

              {/* Mobile-only trust strip */}
              <div className="lg:hidden mt-10 pt-8 border-t border-border grid grid-cols-3 gap-4">
                {[
                  { value: "50+", label: "Open Roles" },
                  { value: "25+", label: "Companies" },
                  { value: "8",   label: "Cities" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-serif text-[2rem] font-bold text-navy leading-none">{s.value}</p>
                    <p className="mt-1.5 text-[9px] font-sans font-semibold uppercase tracking-[0.18em] text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: editorial visual panel ── */}
            <div className="lg:col-span-5 hidden lg:flex flex-col">
              <div className="flex-1 bg-navy relative overflow-hidden flex flex-col justify-between p-8">

                {/* Subtle grid */}
                <div className="absolute inset-0 opacity-[0.035]" style={{
                  backgroundImage: [
                    "repeating-linear-gradient(0deg,   #B08D57 0px, #B08D57 1px, transparent 1px, transparent 64px)",
                    "repeating-linear-gradient(90deg,  #B08D57 0px, #B08D57 1px, transparent 1px, transparent 64px)",
                  ].join(", "),
                }} />

                {/* Ghost large serif */}
                <div className="absolute -bottom-6 -right-4 font-serif text-[11rem] font-bold text-white/[0.025] leading-none select-none pointer-events-none tracking-tighter">
                  PM
                </div>

                {/* Corner marks */}
                <div className="absolute top-5 left-5 w-6 h-6 border-t border-l border-brass opacity-30" />
                <div className="absolute top-5 right-5 w-6 h-6 border-t border-r border-brass opacity-30" />

                {/* Top label */}
                <div className="relative">
                  <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.3em] text-brass">
                    TalentGrid · Executive Recruitment
                  </p>
                </div>

                {/* Mid: floating stat cards */}
                <div className="relative space-y-3">
                  {[
                    { value: "50+", label: "Open Positions",       sub: "Across 8 cities" },
                    { value: "25+", label: "Hiring Organisations", sub: "Pre-vetted employers" },
                    { value: "100%", label: "Pre-screened",        sub: "Every candidate assessed" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-5 border border-navy-border bg-navy-subtle/40 px-5 py-4">
                      <p className="font-serif text-[1.8rem] font-bold text-surface leading-none w-14 flex-shrink-0">{s.value}</p>
                      <div>
                        <p className="text-[11px] font-sans font-semibold text-surface">{s.label}</p>
                        <p className="text-[10px] font-sans text-[#5A7A9A] mt-0.5">{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom: quote */}
                <div className="relative border-t border-navy-border pt-6">
                  <div className="w-6 h-[1px] bg-brass mb-3" />
                  <p className="font-serif text-[1rem] text-[#C8D8E8] leading-relaxed">
                    &ldquo;The quality of your next role depends on the quality of the platform.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════════════
          ║  SEARCH STRIP — full-width dark navy
          ╚════════════════════════════════════════════════════ */}
      <section className="bg-navy-mid border-b border-navy-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8">
          <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-4">
            Search Opportunities
          </p>
          <JobSearch />
        </div>
      </section>

      {/* ╔════════════════════════════════════════════════════
          ║  INTRODUCTION — split editorial
          ╚════════════════════════════════════════════════════ */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-0">

            {/* Left */}
            <div className="lg:col-span-6 lg:pr-14 lg:border-r lg:border-border">
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.24em] text-brass mb-5">
                A More Considered Approach to Recruitment
              </p>
              <div className="w-9 h-[1px] bg-brass mb-6" />
              <p className="font-serif text-[1.35rem] text-navy font-medium leading-relaxed max-w-md">
                TalentGrid connects project management professionals and organisations
                through a focused, screened, and transparent recruitment process.
              </p>
            </div>

            {/* Right */}
            <div className="lg:col-span-6 lg:pl-14 flex flex-col justify-center">
              <p className="text-[14px] font-sans text-muted leading-relaxed mb-8 max-w-md">
                PM professionals deserve more than a generic job board. We specialise
                in one domain, screen every applicant, and make every interview count.
              </p>
              <div className="space-y-4">
                {["Project Management roles only — no noise.", "Every candidate is assessed before they reach you.", "Stronger hiring decisions, fewer wasted interviews."].map((s, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1.5 w-4 h-[1px] bg-brass flex-shrink-0" />
                    <p className="text-[13px] font-sans text-charcoal">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════════════
          ║  CAREER PRACTICES — dark navy
          ╚════════════════════════════════════════════════════ */}
      <section className="bg-navy border-b border-navy-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-2">
                Role Levels
              </p>
              <h2 className="font-serif text-2xl font-bold text-surface tracking-tight">
                One domain. Two clear paths.
              </h2>
            </div>
            <Link href="/jobs"
              className="hidden sm:inline-flex text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[#7A95B0] hover:text-brass border-b border-navy-border hover:border-brass pb-0.5 transition-colors duration-150">
              All Opportunities →
            </Link>
          </div>

          <div>
            {jobCategories.map((cat, i) => (
              <JobCategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════════════
          ║  FEATURED OPPORTUNITY
          ╚════════════════════════════════════════════════════ */}
      <section className="bg-ivory border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

            {/* Left: job content on dark panel */}
            <div className="lg:col-span-7 bg-navy px-10 py-12">
              <JobCard job={featuredJob} featured />
            </div>

            {/* Right: architectural visual panel */}
            <div className="lg:col-span-5 hidden lg:flex flex-col">
              {/* Main decorative block */}
              <div className="flex-1 bg-[#0D2035] relative overflow-hidden flex flex-col justify-between p-10">
                <div className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: "repeating-linear-gradient(90deg, #B08D57 0px, #B08D57 1px, transparent 1px, transparent 40px)",
                  }}
                />
                <div className="relative">
                  <div className="w-6 h-6 border-t-[2px] border-l-[2px] border-brass opacity-50 mb-8" />
                  <p className="font-serif text-[2.5rem] font-bold text-[#1A3352] leading-none select-none">
                    01
                  </p>
                </div>
                <div className="relative">
                  <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-brass mb-3">
                    From our selection
                  </p>
                  <p className="text-[13px] font-sans text-[#5A7A9A] leading-relaxed">
                    Senior positions highlighted weekly — representing genuine
                    opportunities with credible, selective employers.
                  </p>
                </div>
              </div>

              {/* Stat strip */}
              <div className="bg-surface border border-border border-t-0 px-8 py-6 grid grid-cols-2 divide-x divide-border">
                {STATS.slice(1, 3).map((s) => (
                  <div key={s.label} className="px-4 first:pl-0 last:pr-0">
                    <p className="font-serif text-[2rem] font-bold text-navy leading-none">{s.value}</p>
                    <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.18em] text-muted mt-1.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════════════
          ║  LATEST OPPORTUNITIES
          ╚════════════════════════════════════════════════════ */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-2">
                Latest Opportunities
              </p>
              <h2 className="font-serif text-2xl font-bold text-navy tracking-tight">
                Recently Posted Roles
              </h2>
            </div>
            <Link href="/jobs"
              className="hidden sm:inline-flex text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-muted hover:text-navy border-b border-border hover:border-navy pb-0.5 transition-colors duration-150">
              View All →
            </Link>
          </div>

          <div className="border-t border-border">
            {latestJobs.map((j) => <JobCard key={j.id} job={j} />)}
          </div>

          <div className="mt-8 sm:hidden text-center">
            <Link href="/jobs"
              className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-muted hover:text-navy transition-colors">
              View All Opportunities →
            </Link>
          </div>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════════════
          ║  WHY TALENTGRID — dark navy, split layout
          ╚════════════════════════════════════════════════════ */}
      <section className="bg-navy border-b border-navy-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

            {/* Left */}
            <div className="lg:col-span-5">
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-5">
                Why TalentGrid
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-surface leading-snug tracking-tight">
                Careers deserve a more considered approach.
              </h2>
              <p className="mt-6 text-[14px] font-sans text-[#7A95B0] leading-relaxed">
                Most platforms optimise for volume. TalentGrid optimises for relevance —
                one domain, pre-screened candidates, zero interview time wasted.
              </p>
              <div className="mt-10">
                <Link href="/register"
                  className="inline-flex items-center text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-surface border border-navy-border hover:border-brass hover:text-brass px-7 py-3 transition-all duration-200">
                  Create Profile →
                </Link>
              </div>
            </div>

            {/* Right — numbered list */}
            <div className="lg:col-span-7">
              {WHY.map((item, i) => (
                <div key={item.num} className={`flex gap-6 ${i < WHY.length - 1 ? "pb-8 mb-8 border-b border-navy-border" : ""}`}>
                  <span className="font-serif text-2xl font-bold text-brass leading-none flex-shrink-0 w-8">
                    {item.num}
                  </span>
                  <div>
                    <h3 className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-surface mb-2.5">
                      {item.title}
                    </h3>
                    <p className="text-[13px] font-sans text-[#7A95B0] leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════════════
          ║  STATISTICS BAND
          ╚════════════════════════════════════════════════════ */}
      <section className="bg-ivory border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {STATS.map((s) => (
              <div key={s.label} className="px-8 first:pl-0 last:pr-0 text-center md:text-left">
                <p className="font-serif text-[2.6rem] sm:text-[3rem] font-bold text-navy leading-none">
                  {s.value}
                </p>
                <p className="mt-2 text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-muted">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          {/* Placeholder disclaimer — remove when live data is available */}
          <p className="mt-6 text-center text-[10px] font-sans text-muted opacity-60">
            * Indicative figures. Will reflect live platform data once fully operational.
          </p>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════════════
          ║  HIRING ORGANISATIONS
          ╚════════════════════════════════════════════════════ */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14">
          <div className="text-center mb-10">
            <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-4">
              Selected Hiring Organisations
            </p>
            <div className="w-9 h-[1px] bg-brass mx-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {featuredCompanies.map((co) => (
              <div key={co.id}
                className="group flex items-center gap-3 border border-border hover:border-navy/20 bg-surface hover:bg-ivory px-4 py-3 transition-all duration-150">
                <div className="w-8 h-8 bg-navy/5 group-hover:bg-navy flex items-center justify-center flex-shrink-0 transition-colors duration-150">
                  <span className="text-[10px] font-sans font-bold text-navy group-hover:text-brass tracking-widest transition-colors duration-150">
                    {co.initials}
                  </span>
                </div>
                <span className="text-[13px] font-sans text-muted group-hover:text-charcoal transition-colors duration-150">
                  {co.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╔════════════════════════════════════════════════════
          ║  FINAL CTA — deep navy
          ╚════════════════════════════════════════════════════ */}
      <section className="bg-navy">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            <div className="lg:col-span-8">
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-6">
                Your Next Move
              </p>
              <h2 className="font-serif text-3xl sm:text-[2.6rem] font-bold text-surface leading-snug tracking-tight">
                A better opportunity<br />could change everything.
              </h2>
              <p className="mt-6 text-[14px] font-sans text-[#7A95B0] leading-relaxed max-w-lg">
                Explore pre-vetted PM roles — Coordinator to Program Manager. Join TalentGrid
                and take your next step with confidence.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/jobs"
                  className="inline-flex items-center text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-navy bg-ivory hover:bg-surface px-8 py-3.5 transition-colors duration-150 rounded-[3px]">
                  View Opportunities
                </Link>
                <Link href="/register"
                  className="inline-flex items-center text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-surface border border-navy-border hover:border-brass hover:text-brass px-8 py-3.5 transition-colors duration-200 rounded-[3px]">
                  Create Profile →
                </Link>
              </div>
            </div>

            {/* Right: decorative stat block */}
            <div className="lg:col-span-4 hidden lg:flex justify-end">
              <div className="border border-navy-border p-8 w-[200px]">
                <div className="w-5 h-[1px] bg-brass mb-6" />
                <p className="font-serif text-[3rem] font-bold text-surface leading-none">{STATS[1].value}</p>
                <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-brass mt-2">
                  Open Roles
                </p>
                <div className="my-7 w-full h-px bg-navy-border" />
                <p className="font-serif text-[3rem] font-bold text-surface leading-none">{STATS[2].value}</p>
                <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-brass mt-2">
                  Partners
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
