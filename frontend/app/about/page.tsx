import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "TalentGrid is a specialist platform connecting experienced PM professionals with verified employers across India.",
};

const HOW = [
  {
    num: "01",
    title: "We list only PM roles",
    body: "Every opportunity on TalentGrid is a project management position — Coordinator to Program Manager. No noise, no irrelevant listings.",
  },
  {
    num: "02",
    title: "We screen every candidate",
    body: "Before a profile is visible to employers, our team reviews experience, skills, and career trajectory. Only qualified professionals reach the hiring stage.",
  },
  {
    num: "03",
    title: "We keep you informed",
    body: "Candidates receive clear updates at every stage. Employers only spend time on candidates who meet their brief.",
  },
  {
    num: "04",
    title: "We close the loop",
    body: "Whether you get the role or not, we provide feedback and continue working with you on your next opportunity.",
  },
];

const VALUES = [
  { title: "Specialisation",  body: "One domain. Done exceptionally well." },
  { title: "Transparency",    body: "No black boxes. You always know where you stand." },
  { title: "Quality over volume", body: "Fewer, better introductions beat high-volume noise every time." },
  { title: "Respect for time",   body: "Yours and the employer's. We don't waste either." },
];

export default function AboutPage() {
  return (
    <div className="bg-ivory min-h-screen">

      {/* ── Page header ── */}
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7">
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.28em] text-brass mb-4">
                About TalentGrid
              </p>
              <h1 className="font-serif text-[2.6rem] sm:text-[3.2rem] font-bold text-surface leading-[1.08] tracking-tight">
                A more considered approach<br />to recruitment.
              </h1>
              <p className="mt-6 text-[14px] font-sans text-[#7A95B0] leading-relaxed max-w-lg">
                TalentGrid was built for one reason: the project management
                community deserves a recruitment platform that actually understands
                what they do.
              </p>
            </div>
            <div className="lg:col-span-5 hidden lg:flex justify-end">
              <div className="border border-navy-border p-8 text-right">
                <p className="font-serif text-[3.5rem] font-bold text-surface leading-none">PM</p>
                <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-brass mt-2">
                  Specialist · Only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mission ── */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 lg:border-r lg:border-border lg:pr-14">
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.24em] text-brass mb-5">
                Our Mission
              </p>
              <div className="w-8 h-[1px] bg-brass mb-6" />
              <p className="font-serif text-[1.4rem] font-medium text-navy leading-relaxed">
                To connect India&apos;s most capable project management professionals
                with organisations that value their expertise.
              </p>
            </div>
            <div className="lg:col-span-7 lg:pl-6 flex flex-col justify-center">
              <p className="text-[14px] font-sans text-muted leading-relaxed mb-6">
                Most job platforms optimise for volume — the more listings, the more clicks,
                the more revenue. We optimise for relevance. Every listing is real. Every
                candidate is assessed. Every introduction is worth making.
              </p>
              <p className="text-[14px] font-sans text-muted leading-relaxed">
                TalentGrid is built for PM professionals across India — from entry-level
                Project Coordinators to experienced Program Managers — who want to take
                their career seriously and work with employers who do the same.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-navy border-b border-navy-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
          <div className="mb-12">
            <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-2">
              How It Works
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-surface tracking-tight">
              The TalentGrid process.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {HOW.map((item, i) => (
              <div key={item.num}
                className={`py-8 px-0 md:px-8 border-b border-navy-border ${
                  i % 2 === 0 ? "md:border-r md:pl-0" : "md:pr-0"
                } ${i >= HOW.length - 2 ? "border-b-0" : ""}`}>
                <span className="font-serif text-3xl font-bold text-brass/30 leading-none block mb-4">
                  {item.num}
                </span>
                <h3 className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-surface mb-3">
                  {item.title}
                </h3>
                <p className="text-[13px] font-sans text-[#7A95B0] leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-ivory border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
          <div className="mb-10">
            <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-2">
              What We Stand For
            </p>
            <h2 className="font-serif text-2xl font-bold text-navy tracking-tight">
              Our values.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-border">
            {VALUES.map((v, i) => (
              <div key={v.title}
                className={`p-8 ${i < VALUES.length - 1 ? "border-b sm:border-b-0 sm:border-r border-border" : ""} ${i === 1 ? "lg:border-r border-border" : ""}`}>
                <div className="w-5 h-[1px] bg-brass mb-5" />
                <h3 className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-navy mb-3">
                  {v.title}
                </h3>
                <p className="text-[13px] font-sans text-muted leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-navy" id="contact">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-5">
                Get Involved
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-surface leading-snug tracking-tight">
                Whether you&apos;re looking for your next role or your next hire —
                TalentGrid is the right place to start.
              </h2>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link href="/jobs"
                className="inline-flex items-center justify-center text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-navy bg-ivory hover:bg-surface px-7 py-3.5 transition-colors duration-150">
                Browse Roles →
              </Link>
              <Link href="/for-employers"
                className="inline-flex items-center justify-center text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-surface border border-navy-border hover:border-brass hover:text-brass px-7 py-3.5 transition-all duration-200">
                For Employers →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
