"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV = [
  { label: "Opportunities", href: "/jobs" },
  { label: "Insights",      href: "/insights" },
  { label: "For Employers", href: "/for-employers" },
  { label: "About",         href: "/about" },
];

/** Slim header for the logged-out landing page. The signed-in app keeps its own header. */
export default function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-sm"
      style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-[74px]">

          <Link href="/" className="flex-shrink-0">
            <span className="block font-serif text-[1.45rem] font-bold text-navy leading-none tracking-tight">
              TalentGrid
            </span>
            <span className="block text-[10px] font-sans font-semibold uppercase tracking-[0.26em] text-muted mt-1">
              Executive Careers
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10" aria-label="Main">
            {NAV.map((l) => (
              <Link key={l.label} href={l.href}
                className="text-[14.5px] font-sans text-charcoal hover:text-brass transition-colors duration-150">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-7">
            <Link href="/login" className="text-[14.5px] font-sans text-charcoal hover:text-brass transition-colors">
              Sign In
            </Link>
            <Link href="/register"
              className="inline-flex items-center gap-2.5 text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid px-7 py-3.5 transition-colors duration-150">
              Join TalentGrid <span aria-hidden>→</span>
            </Link>
          </div>

          <button type="button" onClick={() => setOpen(!open)}
            className="lg:hidden p-2 -mr-2 text-charcoal hover:text-brass transition-colors"
            aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-ivory">
          <nav className="max-w-[1400px] mx-auto px-6 py-4" aria-label="Mobile">
            {NAV.map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
                className="block py-3.5 text-[15px] font-sans text-charcoal border-b border-border hover:text-brass transition-colors">
                {l.label}
              </Link>
            ))}
            <div className="pt-5 flex flex-col gap-3">
              <Link href="/login" onClick={() => setOpen(false)}
                className="block text-center py-3 text-[14px] font-sans text-charcoal border border-border hover:border-navy/40 transition-colors">
                Sign In
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}
                className="block text-center py-3.5 text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid transition-colors">
                Join TalentGrid →
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
