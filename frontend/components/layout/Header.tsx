"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, User, FileText, CreditCard, Settings, LogOut, Search } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { getUser, clearSession, type AuthUser } from "@/lib/auth";
import { fetchSubscription, FREE_SUBSCRIPTION, type SubscriptionInfo } from "@/lib/account";

const candidateLinks = [
  { label: "Jobs",             href: "/jobs" },
  { label: "Applications",     href: "/applications" },
  { label: "Saved",            href: "/saved" },
  { label: "Career Insights",  href: "/insights" },
];

const adminLinks = [
  { label: "Candidates",    href: "/admin" },
  { label: "Employers",     href: "/admin/employers" },
  { label: "Opportunities", href: "/admin/jobs" },
  { label: "Insights",      href: "/admin/insights" },
];

const employerLinks = [
  { label: "My Jobs",         href: "/employer/dashboard" },
  { label: "Company Profile", href: "/employer/company" },
  { label: "Insights",        href: "/insights" },
];

const publicLinks = [
  { label: "Opportunities", href: "/jobs" },
  { label: "Insights",      href: "/insights" },
  { label: "For Employers", href: "/for-employers" },
  { label: "About",         href: "/about" },
];

export default function Header() {
  const [open, setOpen]       = useState(false);
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen]   = useState(false);
  const pathname               = usePathname();
  const router                 = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(FREE_SUBSCRIPTION);

  useEffect(() => {
    // Syncing from localStorage (external system) — setState here is intentional
    const u = getUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(u);
    if (u?.role === "CANDIDATE") {
      fetchSubscription().then(setSubscription);
    }
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSignOut() {
    clearSession();
    router.push("/");
  }

  const isCandidate = user?.role === "CANDIDATE";
  const navLinks = user?.role === "ADMIN" ? adminLinks
    : user?.role === "EMPLOYER" ? employerLinks
    : isCandidate ? candidateLinks
    : publicLinks;
  const logoHref = isCandidate ? "/dashboard" : "/";

  return (
    <header className="sticky top-0 z-50 bg-surface">
      {/* Antique gold top rule */}
      <div className="h-[2px] bg-brass w-full" />

      {/* Main nav row */}
      <div className="border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[60px]">

            {/* Logo mark */}
            <Link href={logoHref} className="flex-shrink-0 group">
              <div className="font-serif text-[1.38rem] font-bold tracking-tight text-navy leading-none">
                TalentGrid
              </div>
              <div className="text-[11px] font-sans font-medium uppercase tracking-[0.25em] text-muted mt-[2px]">
                Executive Careers
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Main">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className={`text-[15px] font-sans transition-colors duration-150 relative ${
                    pathname === l.href
                      ? "text-navy font-medium after:absolute after:-bottom-[19px] after:left-0 after:right-0 after:h-[2px] after:bg-brass"
                      : "text-muted hover:text-charcoal"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-4">
              {isCandidate && user ? (
                <>
                  <Link href="/jobs" aria-label="Search roles" className="text-muted hover:text-charcoal transition-colors">
                    <Search className="w-[17px] h-[17px]" />
                  </Link>

                  {/* Subscription badge */}
                  <Link href="/subscription"
                    className={`text-[11px] font-sans font-semibold uppercase tracking-[0.16em] px-2.5 py-1 border transition-colors ${
                      subscription.active
                        ? "text-brass border-brass/50 bg-highlight-strong hover:bg-highlight-strong"
                        : "text-muted border-border hover:border-navy/30"
                    }`}>
                    {subscription.active ? "PRO" : "FREE"}
                  </Link>

                  {/* Notifications */}
                  <NotificationBell refreshKey={pathname} />

                  {/* Avatar dropdown */}
                  <div className="relative" ref={menuRef}>
                    <button type="button" onClick={() => setMenuOpen((v) => !v)}
                      className="flex items-center gap-2 group">
                      <span className="w-7 h-7 rounded-full bg-navy flex items-center justify-center text-[13px] font-sans font-bold text-surface">
                        {user.fullName[0]}
                      </span>
                      <span className="text-[15px] font-sans text-charcoal group-hover:text-navy transition-colors">
                        {user.fullName.split(" ")[0]}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 mt-3 w-52 bg-surface border border-border shadow-lg py-1">
                        {[
                          { label: "My Profile", href: "/profile",              icon: User },
                          { label: "Resume",     href: "/profile?section=resume", icon: FileText },
                          { label: "Subscription", href: "/subscription",       icon: CreditCard },
                          { label: "Settings",   href: "/settings",             icon: Settings },
                        ].map((item) => (
                          <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[15px] font-sans text-charcoal hover:bg-ivory hover:text-navy transition-colors">
                            <item.icon className="w-3.5 h-3.5 text-muted" /> {item.label}
                          </Link>
                        ))}
                        <button type="button" onClick={() => { setMenuOpen(false); handleSignOut(); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[15px] font-sans text-charcoal hover:bg-ivory hover:text-navy transition-colors border-t border-border">
                          <LogOut className="w-3.5 h-3.5 text-muted" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : user ? (
                <>
                  <NotificationBell refreshKey={pathname} />
                  <Link href={user.role === "ADMIN" ? "/admin" : "/employer/dashboard"}
                    className="text-[15px] font-sans text-muted hover:text-charcoal transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/settings" aria-label="Settings" className="text-muted hover:text-charcoal transition-colors">
                    <Settings className="w-[17px] h-[17px]" />
                  </Link>
                  <button type="button" onClick={handleSignOut}
                    className="text-[13px] font-sans font-medium uppercase tracking-[0.18em] text-muted hover:text-charcoal transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login"
                    className="text-[15px] font-sans text-muted hover:text-charcoal transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register"
                    className="text-[13px] font-sans font-medium uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid px-5 py-2.5 transition-colors duration-150">
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
            {navLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block py-3 text-[16px] font-sans border-b border-border transition-colors ${
                  pathname === l.href ? "text-navy font-medium" : "text-muted hover:text-charcoal"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2.5">
              {user ? (
                <>
                  {isCandidate && (
                    <Link href="/subscription" onClick={() => setOpen(false)}
                      className="block text-center py-2.5 text-[15px] font-sans text-charcoal border border-border hover:bg-ivory transition-colors">
                      Subscription — {subscription.active ? "PRO" : "Free"}
                    </Link>
                  )}
                  <Link href="/settings" onClick={() => setOpen(false)}
                    className="block text-center py-2.5 text-[15px] font-sans text-charcoal border border-border hover:bg-ivory transition-colors">
                    Settings
                  </Link>
                  <Link
                    href={isCandidate ? "/profile" : user.role === "ADMIN" ? "/admin" : "/employer/dashboard"}
                    onClick={() => setOpen(false)}
                    className="block text-center py-2.5 text-[15px] font-sans text-charcoal border border-border hover:bg-ivory transition-colors"
                  >
                    {isCandidate ? "My Profile" : "Dashboard"}
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); handleSignOut(); }}
                    className="block w-full text-center py-3 text-[13px] font-sans font-medium uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block text-center py-2.5 text-[15px] font-sans text-charcoal border border-border hover:bg-ivory transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="block text-center py-3 text-[13px] font-sans font-medium uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid transition-colors"
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
