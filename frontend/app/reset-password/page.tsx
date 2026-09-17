"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { api, ApiError } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") ?? "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [showCfm,   setShowCfm]   = useState(false);
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!token) setError("Invalid or missing reset link. Please request a new one.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError("This reset link has expired or already been used. Please request a new one.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inp = (err?: boolean) =>
    `w-full px-4 py-3 text-[15px] font-sans text-charcoal placeholder-muted-light bg-transparent border focus:outline-none transition-colors duration-150 ${
      err ? "border-red-400" : "border-border focus:border-navy"
    }`;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left: form */}
      <div className="flex-1 bg-surface flex flex-col">

        <div className="lg:hidden flex items-center px-6 py-5 border-b border-border">
          <Link href="/">
            <div className="font-serif text-xl font-bold text-navy leading-none">TalentGrid</div>
            <div className="text-[11px] font-sans font-semibold uppercase tracking-[0.22em] text-muted mt-0.5">Executive Careers</div>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-between px-6 py-12 sm:px-12 lg:px-16 xl:px-20">

          <div className="hidden lg:block">
            <Link href="/">
              <div className="font-serif text-[1.43rem] font-bold text-navy leading-none">TalentGrid</div>
              <div className="text-[11px] font-sans font-semibold uppercase tracking-[0.26em] text-muted mt-1">Executive Careers · India</div>
            </Link>
          </div>

          <div className="w-full max-w-[360px] mx-auto lg:mx-0 py-10 lg:py-0">

            <Link href="/login"
              className="inline-flex items-center gap-2 text-[13px] font-sans text-muted hover:text-navy transition-colors mb-8">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>

            {success ? (
              <div>
                <CheckCircle2 className="w-9 h-9 text-green-500 mb-5" strokeWidth={1.5} />
                <h1 className="font-serif text-[1.98rem] font-bold text-navy leading-tight mb-3">
                  Password Reset!
                </h1>
                <p className="text-[15px] font-sans text-muted leading-relaxed mb-8">
                  Your password has been updated. Redirecting you to sign in…
                </p>
                <Link href="/login"
                  className="inline-flex items-center gap-2 text-[13px] font-sans font-semibold uppercase tracking-[0.2em] text-surface bg-navy hover:bg-navy-mid px-7 py-3.5 transition-colors duration-150">
                  Sign In Now →
                </Link>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <div className="w-6 h-[2px] bg-brass mb-5" />
                  <h1 className="font-serif text-[1.98rem] font-bold text-navy leading-tight mb-2">
                    Set new password
                  </h1>
                  <p className="text-[15px] font-sans text-muted leading-relaxed">
                    Choose a strong password for your TalentGrid account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">

                  <div>
                    <label className="block text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-muted mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        placeholder="Minimum 8 characters"
                        className={`${inp()} pr-12`}
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute inset-y-0 right-0 px-4 text-muted hover:text-navy transition-colors">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-muted mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCfm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                        placeholder="Re-enter your password"
                        className={`${inp()} pr-12`}
                      />
                      <button type="button" onClick={() => setShowCfm(!showCfm)}
                        className="absolute inset-y-0 right-0 px-4 text-muted hover:text-navy transition-colors">
                        {showCfm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="flex items-start gap-2 text-[14px] font-sans text-red-600 bg-red-50 border border-red-200 px-4 py-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
                    </p>
                  )}

                  <div className="pt-2">
                    <button type="submit" disabled={loading || !token}
                      className="w-full py-3.5 text-[13px] font-sans font-semibold uppercase tracking-[0.22em] text-surface bg-navy hover:bg-navy-mid disabled:opacity-60 transition-colors duration-150 focus:outline-none">
                      {loading ? "Resetting…" : "Reset Password →"}
                    </button>
                  </div>

                  <p className="text-center text-[14px] font-sans text-muted">
                    Link expired?{" "}
                    <Link href="/forgot-password" className="text-navy underline underline-offset-4 hover:text-brass transition-colors">
                      Request a new one
                    </Link>
                  </p>
                </form>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <p className="text-[13px] font-sans text-muted/50">&copy; {new Date().getFullYear()} TalentGrid</p>
          </div>
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[48%] bg-navy flex-col justify-between p-14 xl:p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(90deg, var(--color-brass) 0px, var(--color-brass) 1px, transparent 1px, transparent 80px)",
        }} />
        <div className="absolute top-8 left-8 w-6 h-6 border-t border-l border-brass opacity-25" />
        <div className="absolute top-8 right-8 w-6 h-6 border-t border-r border-brass opacity-25" />
        <div className="absolute bottom-8 left-8 w-6 h-6 border-b border-l border-brass opacity-25" />
        <div className="absolute bottom-8 right-8 w-6 h-6 border-b border-r border-brass opacity-25" />
        <div className="relative">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-brass">Account Security</p>
        </div>
        <div className="relative">
          <div className="w-12 h-[1px] bg-brass/50 mb-10" />
          <h2 className="font-serif text-[3.15rem] xl:text-[3.57rem] font-bold text-surface leading-[1.05] tracking-tight">
            Almost there,<br />
            <span className="text-brass/80">you&apos;re nearly in.</span>
          </h2>
          <p className="mt-8 text-[15px] font-sans text-navy-text leading-relaxed max-w-[300px]">
            Set a strong password and get back to your profile and applications in seconds.
          </p>
        </div>
        <div className="relative">
          <p className="text-[14px] font-sans text-navy-text-dim">
            Remember your password?{" "}
            <Link href="/login" className="text-navy-text hover:text-brass underline-offset-4 hover:underline transition-colors">
              Sign in instead →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><p className="text-[15px] font-sans text-muted">Loading…</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
