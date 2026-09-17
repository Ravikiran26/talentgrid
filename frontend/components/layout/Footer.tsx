import Link from "next/link";

const cols = [
  {
    title: "Opportunities",
    links: [
      { label: "All Roles",       href: "/jobs" },
      { label: "Coordinator & Analyst", href: "/jobs?category=coordinator" },
      { label: "Manager & Lead",  href: "/jobs?category=manager" },
    ],
  },
  {
    title: "Candidates",
    links: [
      { label: "Create Profile",  href: "/register" },
      { label: "Sign In",         href: "/login" },
      { label: "Forgot Password", href: "/forgot-password" },
    ],
  },
  {
    title: "Employers",
    links: [
      { label: "For Employers",      href: "/for-employers" },
      { label: "Post Opportunities", href: "/for-employers#post" },
      { label: "Enquiries",          href: "/for-employers#contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About TalentGrid", href: "/about" },
      { label: "Contact",          href: "/about#contact" },
      { label: "Privacy Policy",   href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-navy-text">
      <div className="h-[2px] bg-brass" />

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pt-14 pb-10">

        {/* Brand + columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-navy-border">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <div className="font-serif text-[1.54rem] font-bold text-surface tracking-tight leading-none">
                TalentGrid
              </div>
              <div className="text-[11px] font-sans font-semibold uppercase tracking-[0.25em] text-brass mt-1.5">
                Executive Careers · India
              </div>
            </Link>
            <p className="mt-5 text-[15px] font-medium text-navy-text leading-relaxed max-w-[240px]">
              A focused recruitment platform for experienced professionals and
              selective employers across India.
            </p>
            <div className="mt-6 flex gap-2">
              {["Technology", "Management", "Operations"].map((tag) => (
                <span key={tag} className="text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-navy-text border border-navy-text-dim/50 px-2 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-[12px] font-sans font-semibold uppercase tracking-[0.22em] text-brass mb-4">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[15px] font-sans font-medium text-navy-text hover:text-surface transition-colors duration-150">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[13px] font-sans font-medium text-navy-text-dim">
            &copy; {new Date().getFullYear()} TalentGrid. All rights reserved.
          </p>
          <p className="text-[13px] font-sans font-medium text-navy-text-dim">
            Powered by <span className="font-semibold text-navy-text">PMAISM</span> · Project Management &amp; Scrum Master Institute
          </p>
        </div>
      </div>
    </footer>
  );
}
