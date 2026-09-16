"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { getUser, clearSession, type AuthUser } from "@/lib/auth";

const candidateLinks = [
  { label: "Opportunities", href: "/jobs" },
  { label: "My Applications", href: "/dashboard" },
  { label: "About",           href: "/about" },
];

const adminLinks = [
  { label: "Candidates",    href: "/admin" },
  { label: "Opportunities", href: "/admin/jobs" },
];

const employerLinks = [
  { label: "My Jobs",    href: "/employer/dashboard" },
  { label: "Candidates", href: "/jobs" },
];

const publicLinks = [
  { label: "Opportunities", href: "/jobs" },
  { label: "For Employers", href: "/for-employers" },
  { label: "About",         href: "/about" },
];

export default function Header() {
  const [open, setOpen]       = useState(false);
  const [user, setUser]       = useState<AuthUser | null>(null);
  const pathname              = usePathname();
  const router                = useRouter();

  useEffect(() => {
    // Syncing from localStorage (external system) — setState here is intentional
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getUser());
  }, [pathname]);

  function handleSignOut() {
    clearSession();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-surface">
      {/* Antique gold top rule */}
      <div className="h-[2px] bg-brass w-full" />

      {/* Main nav row */}
      <div className="border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[60px]">

            {/* Logo mark */}
            <Link href="/" className="flex-shrink-0 group">
              <div className="font-serif text-[1.25rem] font-bold tracking-tight text-navy leading-none">
                TalentGrid
              </div>
              <div className="text-[9px] font-sans font-medium uppercase tracking-[0.25em] text-muted mt-[2px]">
                Executive Careers
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Main">
              {(user?.role === "ADMIN" ? adminLinks : user?.role === "EMPLOYER" ? employerLinks : user?.role === "CANDIDATE" ? candidateLinks : publicLinks).map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className={`text-[13px] font-sans transition-colors duration-150 ${
                    pathname === l.href
                      ? "text-navy font-medium"
                      : "text-muted hover:text-charcoal"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-5">
              {user ? (
                <>
                  <Link href={user.role === "ADMIN" ? "/admin" : user.role === "EMPLOYER" ? "/employer/dashboard" : "/profile"}
                    className="text-[13px] font-sans text-muted hover:text-charcoal transition-colors">
                    {user.role === "ADMIN" || user.role === "EMPLOYER" ? "Dashboard" : user.fullName.split(" ")[0]}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-muted hover:text-charcoal transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login"
                    className="text-[13px] font-sans text-muted hover:text-charcoal transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register"
                    className="text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid px-5 py-2.5 transition-colors duration-150">
                    Join TalentGrid →
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              className="md:hidden p-2 text-muted hover:text-charcoal"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <div className="md:hidden bg-surface border-b border-border">
          <nav className="max-w-[1280px] mx-auto px-6 py-4" aria-label="Mobile">
            {(user?.role === "ADMIN" ? adminLinks : user?.role === "EMPLOYER" ? employerLinks : user?.role === "CANDIDATE" ? candidateLinks : publicLinks).map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block py-3 text-[14px] font-sans border-b border-border transition-colors ${
                  pathname === l.href ? "text-navy font-medium" : "text-muted hover:text-charcoal"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2.5">
              {user ? (
                <>
                  <Link
                    href={user.role === "ADMIN" ? "/admin" : user.role === "EMPLOYER" ? "/employer/dashboard" : "/profile"}
                    onClick={() => setOpen(false)}
                    className="block text-center py-2.5 text-[13px] font-sans text-charcoal border border-border hover:bg-ivory transition-colors"
                  >
                    {user.role === "ADMIN" || user.role === "EMPLOYER" ? "Dashboard" : "My Profile"}
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); handleSignOut(); }}
                    className="block w-full text-center py-3 text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block text-center py-2.5 text-[13px] font-sans text-charcoal border border-border hover:bg-ivory transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="block text-center py-3 text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid transition-colors"
                  >
                    Join TalentGrid →
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
