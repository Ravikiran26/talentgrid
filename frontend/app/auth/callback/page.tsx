"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { setSession, type AuthUser } from "@/lib/auth";

/**
 * Landing page for social sign-in. The backend redirects here with either
 * `#token=<jwt>` or `#error=<code>` in the URL fragment (never sent to a server).
 */

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed:       "Sign-in was cancelled or the provider returned an error. Please try again.",
  email_missing:      "Your provider account has no e-mail address we can use. Please register with e-mail and password.",
  email_not_verified: "Your provider e-mail address is not verified. Verify it with the provider, or register with e-mail and password.",
  admin_not_allowed:  "Administrator accounts must sign in with a password.",
  unknown_provider:   "This sign-in provider is not supported.",
};

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = params.get("token");
    const errorCode = params.get("error");

    // Drop the fragment so the token does not linger in history / the address bar.
    window.history.replaceState(null, "", window.location.pathname);

    if (errorCode || !token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(ERROR_MESSAGES[errorCode ?? ""] ?? "Sign-in failed. Please try again.");
      return;
    }

    let cancelled = false;
    api
      .get<AuthUser>("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((user) => {
        if (cancelled) return;
        setSession(token, user);
        router.replace(user.role === "CANDIDATE" ? "/dashboard" : user.role === "EMPLOYER" ? "/employer/dashboard" : "/admin");
      })
      .catch(() => {
        if (!cancelled) setError("We could not complete your sign-in. Please try again.");
      });

    return () => { cancelled = true; };
  }, [router]);

  if (!error) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center" aria-busy="true">
        <p className="text-[15px] font-sans text-muted">Completing sign-in…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] bg-surface border border-border px-9 py-9"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
        <h1 className="font-serif text-[1.65rem] font-bold text-navy mb-4">Sign-in failed</h1>
        <p className="flex items-start gap-2 text-[14px] font-sans text-red-600 bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
        </p>
        <Link href="/login"
          className="mt-6 inline-block w-full text-center py-3.5 text-[15px] font-sans font-semibold text-surface bg-navy hover:bg-navy-mid transition-colors duration-150">
          Back to login
        </Link>
      </div>
    </div>
  );
}
