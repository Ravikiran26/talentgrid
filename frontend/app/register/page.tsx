"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Check } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { setSession, type AuthUser } from "@/lib/auth";
import SocialAuth from "@/components/auth/SocialAuth";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  emailTaken?: boolean;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function validate(d: FormData): FormErrors {
  const e: FormErrors = {};
  if (!d.fullName.trim() || d.fullName.trim().length < 2)
    e.fullName = "Please enter your full name.";
  if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
    e.email = "Enter a valid email address.";
  if (!d.phone || !/^[6-9]\d{9}$/.test(d.phone.replace(/\s/g, "")))
    e.phone = "Enter a valid 10-digit Indian mobile number.";
  if (!d.password || !PASSWORD_RE.test(d.password))
    e.password = "Password must be at least 8 characters with a letter and a digit.";
  if (!d.confirmPassword || d.password !== d.confirmPassword)
    e.confirmPassword = "Passwords do not match.";
  return e;
}

const TRUST_POINTS = [
  "Pre-screened PM roles — no irrelevant listings",
  "Direct access to verified hiring organisations",
  "Transparent application tracking at every stage",
  "Get discovered by India's top companies",
];

const EMPLOYER_TRUST = [
  "Post verified PM roles — reach pre-screened candidates",
  "Manage applications and shortlist from your dashboard",
  "Only pay for quality — no irrelevant CVs",
  "Dedicated support for your hiring brief",
];

export default function RegisterPage() {
  const [role,    setRole]    = useState<"CANDIDATE" | "EMPLOYER">("CANDIDATE");
  const [showPwd, setShowPwd] = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [errors, setErrors]   = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "",
  });

  function upd(field: keyof FormData, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => {
      const next = { ...p, [field]: undefined };
      if (field === "email") next.emailTaken = false;
      return next;
    });
    if (apiError) setApiError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");
    try {
      const res = await api.post<{ token: string; expiresInMs: number; user: AuthUser }>(
        "/api/auth/register",
        { fullName: form.fullName, email: form.email, phone: form.phone, password: form.password, role },
      );
      setSession(res.token, res.user);
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors((p) => ({
          ...p,
          email: "An account with this email already exists.",
          emailTaken: true,
        }));
      } else if (err instanceof ApiError && err.status === 400) {
        setApiError(err.message || "Please check the form and try again.");
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
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[980px] flex gap-5 items-stretch">

          {/* ── Left card: value proposition ── */}
          <div className="hidden md:flex flex-col flex-1 bg-surface border border-border overflow-hidden"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>

            {/* Navy header strip */}
            <div className="bg-navy px-10 pt-9 pb-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: [
                  "repeating-linear-gradient(0deg,#B08D57 0,#B08D57 1px,transparent 1px,transparent 60px)",
                  "repeating-linear-gradient(90deg,#B08D57 0,#B08D57 1px,transparent 1px,transparent 60px)",
                ].join(","),
              }} />
              <div className="relative">
                <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-3">
                  {role === "EMPLOYER" ? "Hire smarter" : "Already a member?"}
                </p>
                <h2 className="font-serif text-[1.75rem] font-bold text-surface leading-tight">
                  {role === "EMPLOYER"
                    ? <>India&apos;s specialist platform<br />for PM hiring.</>
                    : <>India&apos;s specialist platform<br />for PM professionals.</>}
                </h2>
              </div>
            </div>

            {/* Trust points */}
            <div className="px-10 py-8 flex-1">
              <ul className="space-y-5">
                {(role === "EMPLOYER" ? EMPLOYER_TRUST : TRUST_POINTS).map((point) => (
                  <li key={point} className="flex items-start gap-4">
                    <div className="mt-0.5 w-5 h-5 bg-navy/8 border border-navy/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-brass" strokeWidth={2.5} />
                    </div>
                    <span className="text-[13px] font-sans text-charcoal leading-snug">{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-9">
                <Link href="/login"
                  className="inline-flex items-center gap-2 text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-navy border border-navy px-7 py-3 hover:bg-navy hover:text-surface transition-all duration-150">
                  Sign In →
                </Link>
              </div>
            </div>

            {/* Stat strip */}
            <div className="border-t border-border px-10 py-6">
              <div className="flex items-center">
                {[["50+", "Open Roles"], ["25+", "Companies"], ["8", "Cities"]].map(([n, l], i, a) => (
                  <div key={l} className={`flex-1 ${i < a.length - 1 ? "border-r border-border pr-4 mr-4" : ""}`}>
                    <p className="font-serif text-[1.4rem] font-bold text-navy leading-none">{n}</p>
                    <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.18em] text-brass mt-1.5">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right card: register form ── */}
          <div className="w-full md:w-[430px] flex-shrink-0 bg-surface border border-border"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>

            <div className="px-9 pt-9 pb-8">

              {submitted ? (
                /* ── Success state ── */
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-navy flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-6 h-6 text-brass" strokeWidth={1.5} />
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-navy mb-3">Account Created!</h1>
                  <p className="text-[13px] font-sans text-muted leading-relaxed mb-8 max-w-[280px] mx-auto">
                    {role === "EMPLOYER"
                      ? <>Welcome to TalentGrid. Your employer account is ready — start posting roles from your dashboard.</>
                      : <>Welcome to TalentGrid. We&apos;ll notify you at <span className="text-charcoal font-medium">{form.email}</span> once reviewed.</>
                    }
                  </p>
                  <Link
                    href={role === "EMPLOYER" ? "/employer/dashboard" : "/jobs"}
                    className="inline-flex items-center gap-2 text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid px-8 py-3.5 transition-colors duration-150">
                    {role === "EMPLOYER" ? "Go to Dashboard →" : "Browse Opportunities →"}
                  </Link>
                </div>
              ) : (
                <>
                  {/* Role toggle */}
                  <div className="flex mb-6 border border-border">
                    <button type="button"
                      onClick={() => setRole("CANDIDATE")}
                      className={`flex-1 py-2.5 text-[11px] font-sans font-semibold uppercase tracking-[0.16em] transition-colors ${
                        role === "CANDIDATE" ? "bg-navy text-surface" : "text-muted hover:text-charcoal"
                      }`}>
                      I&apos;m a Candidate
                    </button>
                    <button type="button"
                      onClick={() => setRole("EMPLOYER")}
                      className={`flex-1 py-2.5 text-[11px] font-sans font-semibold uppercase tracking-[0.16em] transition-colors border-l border-border ${
                        role === "EMPLOYER" ? "bg-navy text-surface" : "text-muted hover:text-charcoal"
                      }`}>
                      I&apos;m an Employer
                    </button>
                  </div>

                  <h1 className="font-serif text-[1.75rem] font-bold text-navy mb-1">
                    {role === "EMPLOYER" ? "Employer Register" : "Register"}
                  </h1>
                  <p className="text-[12px] font-sans text-muted mb-7">
                    Already registered?{" "}
                    <Link href="/login" className="text-brass hover:text-[#9A7A48] font-medium transition-colors">
                      Login here
                    </Link>
                  </p>

                  <form onSubmit={handleSubmit} noValidate className="space-y-4">

                    <Field label="Full Name" error={errors.fullName}>
                      <input
                        id="fullname" type="text" autoComplete="name" required
                        value={form.fullName}
                        onChange={(e) => upd("fullName", e.target.value)}
                        placeholder="Ravi Kumar"
                        className={inputCls(errors.fullName)}
                      />
                    </Field>

                    <Field label="Email ID" error={errors.email}>
                      <input
                        id="regemail" type="email" autoComplete="email" required
                        value={form.email}
                        onChange={(e) => upd("email", e.target.value)}
                        placeholder="you@example.com"
                        className={inputCls(errors.email)}
                      />
                      {errors.emailTaken && (
                        <p className="mt-1.5 text-[11px] font-sans text-muted">
                          Already have an account?{" "}
                          <Link href="/login" className="text-brass hover:text-[#9A7A48] font-medium">
                            Login instead →
                          </Link>
                        </p>
                      )}
                    </Field>

                    <Field label="Mobile Number" error={errors.phone}>
                      <div className="flex">
                        <span className={prefixCls(errors.phone)}>+91</span>
                        <input
                          id="phone" type="tel" autoComplete="tel" required maxLength={10}
                          value={form.phone}
                          onChange={(e) => upd("phone", e.target.value)}
                          placeholder="9876543210"
                          className={`${inputCls(errors.phone)} border-l-0 flex-1`}
                        />
                      </div>
                    </Field>

                    <Field label="Password" error={errors.password}>
                      <div className="relative">
                        <input
                          id="regpwd" type={showPwd ? "text" : "password"}
                          autoComplete="new-password" required
                          value={form.password}
                          onChange={(e) => upd("password", e.target.value)}
                          placeholder="Minimum 8 characters"
                          className={`${inputCls(errors.password)} pr-16`}
                        />
                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className="absolute inset-y-0 right-0 px-4 text-[12px] font-sans font-medium text-brass hover:text-[#9A7A48] transition-colors"
                          aria-label={showPwd ? "Hide" : "Show"}>
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </Field>

                    <Field label="Confirm Password" error={errors.confirmPassword}>
                      <div className="relative">
                        <input
                          id="cfmpwd" type={showCfm ? "text" : "password"}
                          autoComplete="new-password" required
                          value={form.confirmPassword}
                          onChange={(e) => upd("confirmPassword", e.target.value)}
                          placeholder="Re-enter your password"
                          className={`${inputCls(errors.confirmPassword)} pr-16`}
                        />
                        <button type="button" onClick={() => setShowCfm(!showCfm)}
                          className="absolute inset-y-0 right-0 px-4 text-[12px] font-sans font-medium text-brass hover:text-[#9A7A48] transition-colors"
                          aria-label={showCfm ? "Hide" : "Show"}>
                          {showCfm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </Field>

                    {apiError && (
                      <p className="flex items-center gap-2 text-[12px] font-sans text-red-600 bg-red-50 border border-red-200 px-4 py-3">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />{apiError}
                      </p>
                    )}

                    <div className="pt-1">
                      <button type="submit" disabled={loading}
                        className="w-full py-3.5 text-[13px] font-sans font-semibold text-surface bg-navy hover:bg-navy-mid active:bg-charcoal transition-colors duration-150 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed">
                        {loading ? "Creating Account…" : "Register Now"}
                      </button>
                    </div>

                    <p className="text-[10px] font-sans text-center text-muted leading-relaxed">
                      By registering you agree to our{" "}
                      <Link href="#" className="text-charcoal underline underline-offset-2 hover:text-navy transition-colors">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" className="text-charcoal underline underline-offset-2 hover:text-navy transition-colors">
                        Privacy Policy
                      </Link>.
                    </p>
                  </form>

                  <SocialAuth mode="register" />
                </>
              )}
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

function inputCls(err?: string) {
  return `w-full px-4 py-3 text-[13px] font-sans text-charcoal placeholder-[#B8B0A6] bg-white border focus:outline-none transition-colors duration-150 ${
    err ? "border-red-400" : "border-[#CFCAC2] focus:border-navy"
  }`;
}

function prefixCls(err?: string) {
  return `inline-flex items-center px-3.5 text-[13px] font-sans text-muted bg-[#F0ECE5] border ${
    err ? "border-red-400" : "border-[#CFCAC2]"
  } border-r-0 select-none`;
}

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-sans font-semibold text-charcoal mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-sans text-red-600">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
