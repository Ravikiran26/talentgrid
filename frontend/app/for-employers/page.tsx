import type { Metadata } from "next";
import Link from "next/link";
import EnquiryForm from "./_EnquiryForm";

export const metadata: Metadata = {
  title: "For Employers",
  description: "Partner with TalentGrid to find pre-screened project management professionals across India.",
};

const BENEFITS = [
  {
    num: "01",
    title: "Pre-screened candidates only",
    body: "Every candidate we present has been reviewed by our team before they reach you. No cold CVs, no irrelevant applications — only professionals who match your brief.",
  },
  {
    num: "02",
    title: "PM domain expertise",
    body: "We understand the difference between a Project Coordinator, a Scrum Master, and a Program Manager. You don't need to explain the role twice.",
  },
  {
    num: "03",
    title: "Faster hiring decisions",
    body: "Because we do the initial screening, your hiring managers spend time only on candidates worth interviewing. Shorter shortlists. Better outcomes.",
  },
  {
    num: "04",
    title: "Transparent process",
    body: "You see who we're presenting, why we're presenting them, and where they are in the process — at every stage.",
  },
];

const HOW = [
  { step: "1", title: "Share your brief",       body: "Tell us about the role, team, and what success looks like. We'll map it to our candidate pool." },
  { step: "2", title: "We source and screen",   body: "Our team identifies and assesses candidates against your criteria before making any introductions." },
  { step: "3", title: "You meet the shortlist", body: "Receive a focused shortlist of 3–5 pre-vetted candidates — each one ready for a first interview." },
  { step: "4", title: "We support the close",   body: "We facilitate offer discussions, gather feedback, and stay involved until the role is filled." },
];

export default function ForEmployersPage() {
  return (
    <div className="bg-ivory min-h-screen">

      {/* ── Hero header ── */}
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-7">
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.28em] text-brass mb-5">
                For Hiring Organisations
              </p>
              <h1 className="font-serif text-[2.6rem] sm:text-[3.4rem] font-bold text-surface leading-[1.06] tracking-tight">
                Hire experienced PM professionals —<br />
                <span className="text-brass/80">without the noise.</span>
              </h1>
              <p className="mt-7 text-[15px] font-sans text-[#7A95B0] leading-relaxed max-w-lg">
                TalentGrid delivers a shortlist of pre-screened project management
                candidates to your team. No CV pile. No time wasted. Just the
                right people, ready to interview.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/register"
                  className="inline-flex items-center text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-navy bg-brass hover:bg-brass/90 px-8 py-3.5 transition-colors duration-150">
                  Register as Employer →
                </Link>
                <a href="#contact"
                  className="inline-flex items-center text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-surface border border-navy-border hover:border-brass hover:text-brass px-8 py-3.5 transition-all duration-200">
                  Submit a Brief
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 hidden lg:flex justify-end">
              <div className="border border-navy-border p-8 space-y-6 w-full max-w-[260px]">
                {[
                  { value: "3–5", label: "Candidates per shortlist" },
                  { value: "100%", label: "Pre-screened profiles" },
                  { value: "8",   label: "Cities covered" },
                ].map((s) => (
                  <div key={s.label} className="border-b border-navy-border pb-6 last:border-b-0 last:pb-0">
                    <p className="font-serif text-[2.2rem] font-bold text-surface leading-none">{s.value}</p>
                    <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.18em] text-brass mt-2">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Why TalentGrid ── */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
          <div className="mb-12">
            <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-2">
              Why TalentGrid
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy tracking-tight">
              Built differently, for better results.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {BENEFITS.map((b) => (
              <div key={b.num} className="border border-border p-8 bg-ivory hover:border-navy/20 transition-colors duration-200">
                <span className="font-serif text-2xl font-bold text-brass/40 leading-none block mb-4">
                  {b.num}
                </span>
                <h3 className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-navy mb-3">
                  {b.title}
                </h3>
                <p className="text-[13px] font-sans text-muted leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How we work ── */}
      <section className="bg-ivory border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
          <div className="mb-12">
            <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-2">
              The Process
            </p>
            <h2 className="font-serif text-2xl font-bold text-navy tracking-tight">
              From brief to hire.
            </h2>
          </div>

          <div className="space-y-0 border-t border-border">
            {HOW.map((item) => (
              <div key={item.step}
                className="group grid grid-cols-12 gap-6 items-start py-8 border-b border-border hover:bg-surface transition-colors duration-150 px-0 hover:px-4">
                <div className="col-span-1">
                  <span className="font-serif text-2xl font-bold text-brass/40 leading-none">{item.step}</span>
                </div>
                <div className="col-span-11 sm:col-span-4">
                  <h3 className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-navy">
                    {item.title}
                  </h3>
                </div>
                <div className="col-span-11 sm:col-span-7 col-start-2 sm:col-start-auto">
                  <p className="text-[13px] font-sans text-muted leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles we fill ── */}
      <section className="bg-navy border-b border-navy-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14">
          <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-6">
            Roles We Fill
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Project Coordinator", "Project Manager", "Scrum Master", "PMO Lead",
              "Program Manager", "Agile Coach", "Release Train Engineer",
              "IT Project Manager", "Cloud Project Manager", "AI Project Manager",
            ].map((role) => (
              <span key={role}
                className="text-[12px] font-sans text-[#8AA0BA] border border-navy-border px-4 py-2">
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / Enquiry form ── */}
      <section className="bg-surface" id="contact">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            <div className="lg:col-span-5">
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-5">
                Submit a Brief
              </p>
              <div className="w-8 h-[1px] bg-brass mb-6" />
              <h2 className="font-serif text-2xl font-bold text-navy mb-4 leading-snug">
                Tell us about your hiring need.
              </h2>
              <p className="text-[13px] font-sans text-muted leading-relaxed">
                Share your role requirements and we&apos;ll come back to you within
                one business day with our availability and approach.
              </p>
            </div>

            <div className="lg:col-span-7">
              <EnquiryForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

