"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, Check } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { setSession, type AuthUser } from "@/lib/auth";
import SocialAuth from "@/components/auth/SocialAuth";

interface FormErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FormErrors {
  const e: FormErrors = {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    e.email = "Enter a valid email address.";
  if (!password || password.length < 8)
    e.password = "Password must be at least 8 characters.";
  return e;
}

const TRUST_POINTS = [
  "Apply with your TalentGrid profile in one click",
  "Get matched to pre-screened senior roles",
  "Track every application from submission to offer",
];

export default function LoginPage() {
  const router = useRouter();
  const [showPwd, setShowPwd]   = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(email, password);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setApiError("");
    setLoading(true);
    try {
      const res = await api.post<{ token: string; expiresInMs: number; user: AuthUser }>(
        "/api/auth/login",
        { email, password },
      );
      setSession(res.token, res.user);
      router.push(res.user.role === "CANDIDATE" ? "/dashboard" : res.user.role === "EMPLOYER" ? "/employer/dashboard" : "/admin");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setApiError("Invalid email or password.");
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-ivory-deep)" }}>

      {/* ── Top navigation bar ── */}
      <div className="bg-surface border-b border-border flex-shrink-0">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[58px]">
            <Link href="/" className="flex-shrink-0">
              <div className="font-serif text-[1.26rem] font-bold text-navy leading-none">TalentGrid</div>
              <div className="text-[10px] font-sans font-semibold uppercase tracking-[0.24em] text-muted mt-0.5">
                Executive Careers
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/jobs" className="text-[15px] font-sans text-muted hover:text-charcoal transition-colors">Jobs</Link>
              <Link href="/about" className="text-[15px] font-sans text-muted hover:text-charcoal transition-colors">About</Link>
              <Link href="/for-employers" className="text-[15px] font-sans text-muted hover:text-charcoal transition-colors">For Employers</Link>
            </nav>
            <p className="text-[14px] font-sans text-muted">
              <span className="hidden sm:inline">New to TalentGrid? </span>
              <Link href="/register" className="font-semibold text-navy hover:text-brass transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 md:py-14">
        <div className="w-full max-w-[920px] grid md:grid-cols-[minmax(0,1fr)_440px] bg-surface border border-border overflow-hidden"
          style={{ boxShadow: "0 4px 24px rgba(7,24,39,0.08)" }}>

          {/* ── Left panel: value proposition ── */}
          <div className="hidden md:flex flex-col justify-between bg-navy px-11 py-12 relative overflow-hidden">
            {/* Subtle grid texture */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: [
                "repeating-linear-gradient(0deg,var(--color-brass) 0,var(--color-brass) 1px,transparent 1px,transparent 60px)",
                "repeating-linear-gradient(90deg,var(--color-brass) 0,var(--color-brass) 1px,transparent 1px,transparent 60px)",
              ].join(","),
            }} />

            <div className="relative">
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-brass">
                Executive Careers
              </p>
              <h2 className="mt-4 font-serif text-[2rem] font-bold text-surface leading-[1.2]">
                Your next career<br />move starts here.
              </h2>

              <ul className="mt-10 space-y-5">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3.5">
                    <Check className="mt-0.5 w-4 h-4 text-brass flex-shrink-0" strokeWidth={2.5} />
                    <span className="text-[15px] font-sans text-navy-text leading-snug">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative mt-12 pt-6 border-t border-navy-border text-[13.5px] font-sans text-navy-text-light leading-relaxed">
              Senior roles in Technology, Management and Operations across India.
            </p>
          </div>

          {/* ── Right panel: login form ── */}
          <div className="px-8 sm:px-11 py-11">
            <h1 className="font-serif text-[1.85rem] font-bold text-navy leading-tight">Welcome back</h1>
            <p className="mt-2 text-[15px] font-sans text-muted">Sign in to continue to TalentGrid.</p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">

              {/* Email */}
              <div>
                <label htmlFor="email"
                  className="block text-[13px] font-sans font-semibold text-charcoal mb-1.5">
                  Email
                </label>
                <input
                  id="email" type="email" autoComplete="email" required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
                  placeholder="you@company.com"
                  className={`w-full px-4 py-3 text-[15px] font-sans text-charcoal placeholder-muted-light bg-white border focus:outline-none transition-colors duration-150 ${
                    errors.email ? "border-red-400" : "border-input focus:border-navy"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-sans text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="pwd" className="text-[13px] font-sans font-semibold text-charcoal">
                    Password
                  </label>
                  <Link href="/forgot-password"
                    className="text-[13.5px] font-sans text-brass hover:text-brass-hover transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="pwd" type={showPwd ? "text" : "password"} autoComplete="current-password" required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }}
                    className={`w-full px-4 py-3 pr-12 text-[15px] font-sans text-charcoal bg-white border focus:outline-none transition-colors duration-150 ${
                      errors.password ? "border-red-400" : "border-input focus:border-navy"
                    }`}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute inset-y-0 right-0 px-4 text-muted hover:text-navy transition-colors"
                    aria-label={showPwd ? "Hide password" : "Show password"}>
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-sans text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errors.password}
                  </p>
                )}
              </div>

              {apiError && (
                <p className="flex items-center gap-2 text-[14px] font-sans text-red-600 bg-red-50 border border-red-200 px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{apiError}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 text-[15px] font-sans font-semibold text-surface bg-navy hover:bg-navy-mid active:bg-charcoal transition-colors duration-150 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <SocialAuth mode="login" />

            <p className="mt-8 text-center text-[14px] font-sans text-muted">
              New to TalentGrid?{" "}
              <Link href="/register" className="font-semibold text-navy hover:text-brass transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
