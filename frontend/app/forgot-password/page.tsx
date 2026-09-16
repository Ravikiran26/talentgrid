"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      // 404/any error — still show success (no email enumeration)
    } finally {
      setLoading(false);
    }
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left: form panel ── */}
      <div className="flex-1 bg-surface flex flex-col">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-border">
          <Link href="/">
            <div className="font-serif text-lg font-bold text-navy leading-none">TalentGrid</div>
            <div className="text-[9px] font-sans font-semibold uppercase tracking-[0.22em] text-muted mt-0.5">
              Executive Careers
            </div>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-between px-6 py-12 sm:px-12 lg:px-16 xl:px-20">

          {/* Desktop logo */}
          <div className="hidden lg:block">
            <Link href="/">
              <div className="font-serif text-[1.3rem] font-bold text-navy leading-none">TalentGrid</div>
              <div className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-muted mt-1">
                Executive Careers · India
              </div>
            </Link>
          </div>

          {/* Content */}
          <div className="w-full max-w-[360px] mx-auto lg:mx-0 py-10 lg:py-0">

            <Link href="/login"
              className="inline-flex items-center gap-2 text-[11px] font-sans text-muted hover:text-navy transition-colors mb-8">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>

            {submitted ? (
              <div>
                <CheckCircle2 className="w-9 h-9 text-brass mb-5" strokeWidth={1.5} />
                <h1 className="font-serif text-[1.8rem] font-bold text-navy leading-tight mb-3">
                  Check your email
                </h1>
                <p className="text-[13px] font-sans text-muted leading-relaxed mb-8">
                  If <span className="text-charcoal font-medium">{email}</span> is registered,
                  you&apos;ll receive a password reset link shortly.
                </p>
                <p className="text-[12px] font-sans text-muted mb-6">
                  Didn&apos;t receive it? Check your spam folder or{" "}
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-navy underline underline-offset-4 hover:text-navy-mid transition-colors">
                    try a different email
                  </button>.
                </p>
                <Link href="/login"
                  className="inline-flex items-center gap-2 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-surface bg-navy hover:bg-navy-mid px-7 py-3.5 transition-colors duration-150">
                  Return to Sign In →
                </Link>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <div className="w-6 h-[2px] bg-brass mb-5" />
                  <h1 className="font-serif text-[1.8rem] font-bold text-navy leading-tight mb-2">
                    Reset your password
                  </h1>
                  <p className="text-[13px] font-sans text-muted leading-relaxed">
                    Enter the email address linked to your TalentGrid account and we&apos;ll
                    send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-7">
                  <div>
                    <label htmlFor="email"
                      className="block text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-muted mb-3">
                      Email Address
                    </label>
                    <input
                      id="email" type="email" autoComplete="email" required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                      placeholder="you@example.com"
                      className={`w-full px-0 pb-3 pt-1 text-[14px] font-sans text-charcoal placeholder-[#C5BFB6] bg-transparent border-0 border-b focus:outline-none transition-colors duration-200 ${
                        error ? "border-red-400" : "border-border focus:border-navy"
                      }`}
                    />
                    {error && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] font-sans text-red-600">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={loading}
                      className="w-full py-3.5 text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-surface bg-navy hover:bg-navy-mid active:bg-charcoal disabled:opacity-60 transition-colors duration-150 focus:outline-none">
                      {loading ? "Sending…" : "Send Reset Link →"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <p className="text-[11px] font-sans text-muted/50">
              &copy; {new Date().getFullYear()} TalentGrid
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: brand panel ── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[48%] bg-navy flex-col justify-between p-14 xl:p-16 relative overflow-hidden">

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(90deg, #B08D57 0px, #B08D57 1px, transparent 1px, transparent 80px)",
        }} />
        <div className="absolute top-8 left-8 w-6 h-6 border-t border-l border-brass opacity-25" />
        <div className="absolute top-8 right-8 w-6 h-6 border-t border-r border-brass opacity-25" />
        <div className="absolute bottom-8 left-8 w-6 h-6 border-b border-l border-brass opacity-25" />
        <div className="absolute bottom-8 right-8 w-6 h-6 border-b border-r border-brass opacity-25" />

        <div className="relative">
          <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.3em] text-brass">
            Account Security
          </p>
        </div>

        <div className="relative">
          <div className="w-12 h-[1px] bg-brass/50 mb-10" />
          <h2 className="font-serif text-[3rem] xl:text-[3.4rem] font-bold text-surface leading-[1.05] tracking-tight">
            Back in minutes,<br />
            <span className="text-brass/80">not days.</span>
          </h2>
          <p className="mt-8 text-[13px] font-sans text-[#7A95B0] leading-relaxed max-w-[300px]">
            We&apos;ll get you back into your account quickly and securely.
            Your profile and applications are safe.
          </p>
        </div>

        <div className="relative">
          <p className="text-[12px] font-sans text-[#4A6A8A]">
            Remember your password?{" "}
            <Link href="/login"
              className="text-[#7A95B0] hover:text-brass underline-offset-4 hover:underline transition-colors">
              Sign in instead →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
