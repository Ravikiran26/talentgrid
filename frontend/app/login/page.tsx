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
  "Get matched to pre-screened PM roles only",
  "Track your application status at every stage",
  "Get discovered by India's top hiring organisations",
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
      router.push("/jobs");
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#EDE8DF" }}>

      {/* ── Top navigation bar ── */}
      <div className="bg-surface border-b border-border flex-shrink-0">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[58px]">
            <Link href="/" className="flex-shrink-0">
              <div className="font-serif text-[1.15rem] font-bold text-navy leading-none">TalentGrid</div>
              <div className="text-[8px] font-sans font-semibold uppercase tracking-[0.24em] text-muted mt-0.5">
                Executive Careers
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/jobs" className="text-[13px] font-sans text-muted hover:text-charcoal transition-colors">Jobs</Link>
              <Link href="/about" className="text-[13px] font-sans text-muted hover:text-charcoal transition-colors">About</Link>
              <Link href="/for-employers" className="text-[13px] font-sans text-muted hover:text-charcoal transition-colors">For Employers</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login"
                className="text-[12px] font-sans font-medium text-navy border border-navy px-5 py-2 hover:bg-navy hover:text-surface transition-colors duration-150">
                Login
              </Link>
              <Link href="/register"
                className="text-[12px] font-sans font-medium text-surface bg-brass hover:bg-[#9A7A48] px-5 py-2 transition-colors duration-150">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-[940px] flex gap-5 items-stretch">

          {/* ── Left card: value proposition ── */}
          <div className="hidden md:flex flex-col flex-1 bg-surface border border-border overflow-hidden"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>

            {/* Navy header strip */}
            <div className="bg-navy px-10 pt-9 pb-8 relative overflow-hidden">
              {/* Subtle grid texture */}
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: [
                  "repeating-linear-gradient(0deg,#B08D57 0,#B08D57 1px,transparent 1px,transparent 60px)",
                  "repeating-linear-gradient(90deg,#B08D57 0,#B08D57 1px,transparent 1px,transparent 60px)",
                ].join(","),
              }} />
              <div className="relative">
                <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-3">
                  New to TalentGrid?
                </p>
                <h2 className="font-serif text-[1.75rem] font-bold text-surface leading-tight">
                  Your next career<br />move starts here.
                </h2>
              </div>
            </div>

            {/* Trust points */}
            <div className="px-10 py-8 flex-1">
              <ul className="space-y-5">
                {TRUST_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-4">
                    <div className="mt-0.5 w-5 h-5 bg-navy/8 border border-navy/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-brass" strokeWidth={2.5} />
                    </div>
                    <span className="text-[13px] font-sans text-charcoal leading-snug">{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-9">
                <Link href="/register"
                  className="inline-flex items-center gap-2 text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-navy border border-navy px-7 py-3 hover:bg-navy hover:text-surface transition-all duration-150">
                  Register for Free →
                </Link>
              </div>
            </div>

            {/* Stat strip bottom */}
            <div className="border-t border-border px-10 py-6">
              <div className="flex items-center gap-0">
                {[["50+", "Open Roles"], ["25+", "Companies"], ["8", "Cities"]].map(([n, l], i, a) => (
                  <div key={l} className={`flex-1 ${i < a.length - 1 ? "border-r border-border" : ""}`}>
                    <p className="font-serif text-[1.4rem] font-bold text-navy leading-none">{n}</p>
                    <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.18em] text-brass mt-1.5">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right card: login form ── */}
          <div className="w-full md:w-[390px] flex-shrink-0 bg-surface border border-border"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>

            <div className="px-9 pt-9 pb-9">

              <h1 className="font-serif text-[1.75rem] font-bold text-navy mb-7">
                Login
              </h1>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* Email */}
                <div>
                  <label htmlFor="email"
                    className="block text-[11px] font-sans font-semibold text-charcoal mb-1.5">
                    Email ID / Username
                  </label>
                  <input
                    id="email" type="email" autoComplete="email" required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
                    placeholder="Enter Email ID / Username"
                    className={`w-full px-4 py-3 text-[13px] font-sans text-charcoal placeholder-[#B8B0A6] bg-white border focus:outline-none transition-colors duration-150 ${
                      errors.email ? "border-red-400" : "border-[#CFCAC2] focus:border-navy"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-sans text-red-600">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="pwd" className="text-[11px] font-sans font-semibold text-charcoal">
                      Password
                    </label>
                    <Link href="/forgot-password"
                      className="text-[12px] font-sans text-brass hover:text-[#9A7A48] transition-colors">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="pwd" type={showPwd ? "text" : "password"} autoComplete="current-password" required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }}
                      placeholder="Enter Password"
                      className={`w-full px-4 py-3 pr-16 text-[13px] font-sans text-charcoal placeholder-[#B8B0A6] bg-white border focus:outline-none transition-colors duration-150 ${
                        errors.password ? "border-red-400" : "border-[#CFCAC2] focus:border-navy"
                      }`}
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute inset-y-0 right-0 px-4 text-[12px] font-sans font-medium text-brass hover:text-[#9A7A48] transition-colors"
                      aria-label={showPwd ? "Hide password" : "Show password"}>
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-sans text-red-600">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errors.password}
                    </p>
                  )}
                </div>

                {apiError && (
                  <p className="flex items-center gap-2 text-[12px] font-sans text-red-600 bg-red-50 border border-red-200 px-4 py-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{apiError}
                  </p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 text-[13px] font-sans font-semibold text-surface bg-navy hover:bg-navy-mid active:bg-charcoal transition-colors duration-150 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? "Logging in…" : "Login"}
                </button>
              </form>

              <SocialAuth mode="login" />

              {/* Mobile register link */}
              <p className="md:hidden mt-6 text-center text-[12px] font-sans text-muted">
                New here?{" "}
                <Link href="/register" className="text-navy font-medium underline underline-offset-2">
                  Register for free
                </Link>
              </p>
            </div>

            {/* Card footer */}
            <div className="border-t border-border px-9 py-4">
              <p className="text-[10px] font-sans text-muted/60 text-center">
                &copy; {new Date().getFullYear()} TalentGrid · Executive Careers · India
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
