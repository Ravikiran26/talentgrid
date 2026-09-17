import Link from "next/link";

const LINKS = [
  { label: "Opportunities", href: "/jobs" },
  { label: "Insights",      href: "/insights" },
  { label: "For Employers", href: "/for-employers" },
  { label: "About",         href: "/about" },
  { label: "Privacy",       href: "/privacy" },
  { label: "Terms",         href: "/terms" },
];

export default function PublicFooter() {
  return (
    <footer className="bg-navy">
      <div className="h-[2px] bg-brass" />
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-10 border-b border-navy-border">
          <div>
            <span className="block font-serif text-[1.6rem] font-bold text-surface leading-none tracking-tight">
              TalentGrid
            </span>
            <span className="block text-[10.5px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mt-2">
              Executive Careers
            </span>
          </div>

          <nav className="flex flex-wrap gap-x-9 gap-y-3" aria-label="Footer">
            {LINKS.map((l) => (
              <Link key={l.label} href={l.href}
                className="text-[14.5px] font-sans font-medium text-navy-text hover:text-surface transition-colors duration-150">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[13px] font-sans font-medium text-navy-text-dim">
            &copy; {new Date().getFullYear()} TalentGrid. All rights reserved.
          </p>
          <p className="text-[13px] font-sans font-medium text-navy-text-dim">
            TalentGrid by <span className="text-navy-text">PMAISM</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
