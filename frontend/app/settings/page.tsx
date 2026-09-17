"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { getUser, setSession, clearSession, type AuthUser } from "@/lib/auth";
import { api } from "@/lib/api";

const input = "w-full px-4 py-3 text-[15px] font-sans text-charcoal placeholder-muted-light bg-white border border-input focus:outline-none focus:border-navy transition-colors";
const label = "block text-[13px] font-sans font-semibold text-charcoal mb-1.5";
const primary = "px-7 py-3 text-[13px] font-sans font-semibold uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

function Notice({ kind, text }: { kind: "ok" | "err"; text: string }) {
  const ok = kind === "ok";
  return (
    <p className={`flex items-center gap-2 text-[14px] font-sans px-4 py-3 border ${ok ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>
      {ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}{text}
    </p>
  );
}

function errMsg(e: unknown, fallback: string) {
  return e instanceof Error && e.message ? e.message : fallback;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    // Fresh copy so authProvider is present for sessions created before it existed.
    api.get<AuthUser>("/api/auth/me").then((me) => { setUser(me); }).catch(() => setUser(u));
  }, [router]);

  if (!user) return <div className="min-h-screen bg-ivory" aria-busy="true" />;
  const isSocial = user.authProvider != null && user.authProvider !== "LOCAL";

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-screen-lg mx-auto px-6 lg:px-10 py-8">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-1">Account</p>
          <h1 className="font-serif text-3xl font-bold text-surface">Settings</h1>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-6 lg:px-10 py-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <section className="border border-border bg-surface p-7">
          <h2 className="font-serif text-[1.32rem] font-semibold text-navy mb-5">Account</h2>
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-muted mb-1">Full Name</p>
          <p className="text-[16px] font-sans text-charcoal mb-5">{user.fullName}</p>
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-muted mb-1">Email</p>
          <p className="text-[16px] font-sans text-charcoal mb-5">{user.email}</p>
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-muted mb-1">Sign-in method</p>
          <p className="text-[16px] font-sans text-charcoal mb-5">
            {isSocial ? `${user.authProvider === "GOOGLE" ? "Google" : "LinkedIn"} account` : "E-mail and password"}
          </p>
          {user.role === "CANDIDATE" && (
            <p className="text-[14px] font-sans text-muted">
              Professional details live on your{" "}
              <Link href="/profile" className="text-navy hover:text-brass underline underline-offset-2">profile</Link>.
            </p>
          )}
        </section>

        <ChangeEmail user={user} onChanged={setUser} />
        <ChangePassword isSocial={isSocial} />
        {user.role !== "ADMIN" && <DeleteAccount isSocial={isSocial} onDeleted={() => { clearSession(); router.push("/"); }} />}
      </div>
    </div>
  );
}

function ChangePassword({ isSocial }: { isSocial: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    if (next.length < 8) { setNotice({ kind: "err", text: "New password must be at least 8 characters." }); return; }
    if (next !== confirm) { setNotice({ kind: "err", text: "New passwords do not match." }); return; }
    setBusy(true);
    try {
      await api.post("/api/account/change-password", { currentPassword: current, newPassword: next });
      setNotice({ kind: "ok", text: "Password updated." });
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      setNotice({ kind: "err", text: errMsg(err, "Could not update password.") });
    } finally { setBusy(false); }
  }

  return (
    <section className="border border-border bg-surface p-7">
      <h2 className="font-serif text-[1.32rem] font-semibold text-navy mb-2">Change password</h2>
      {isSocial && (
        <p className="text-[14px] font-sans text-muted mb-4">
          You signed up with a social account, so you may not have a password yet. Use{" "}
          <Link href="/forgot-password" className="text-navy underline underline-offset-2">forgot password</Link> to set one first.
        </p>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div><label className={label} htmlFor="cur">Current password</label><input id="cur" type="password" autoComplete="current-password" className={input} value={current} onChange={(e) => setCurrent(e.target.value)} required /></div>
        <div><label className={label} htmlFor="new">New password</label><input id="new" type="password" autoComplete="new-password" className={input} value={next} onChange={(e) => setNext(e.target.value)} required /></div>
        <div><label className={label} htmlFor="cnf">Confirm new password</label><input id="cnf" type="password" autoComplete="new-password" className={input} value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
        {notice && <Notice {...notice} />}
        <button type="submit" disabled={busy} className={primary}>{busy ? "Saving…" : "Update password"}</button>
      </form>
    </section>
  );
}

function ChangeEmail({ user, onChanged }: { user: AuthUser; onChanged: (u: AuthUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    setBusy(true);
    try {
      const res = await api.post<{ token: string; user: AuthUser }>("/api/account/change-email", { password, newEmail: email });
      setSession(res.token, res.user);
      onChanged(res.user);
      setNotice({ kind: "ok", text: `E-mail changed to ${res.user.email}.` });
      setEmail(""); setPassword("");
    } catch (err) {
      setNotice({ kind: "err", text: errMsg(err, "Could not change e-mail.") });
    } finally { setBusy(false); }
  }

  return (
    <section className="border border-border bg-surface p-7">
      <h2 className="font-serif text-[1.32rem] font-semibold text-navy mb-2">Change e-mail</h2>
      <p className="text-[14px] font-sans text-muted mb-4">Currently <span className="text-charcoal">{user.email}</span>. You will stay signed in.</p>
      <form onSubmit={submit} className="space-y-4">
        <div><label className={label} htmlFor="em">New e-mail</label><input id="em" type="email" autoComplete="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div><label className={label} htmlFor="pw">Password</label><input id="pw" type="password" autoComplete="current-password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        {notice && <Notice {...notice} />}
        <button type="submit" disabled={busy} className={primary}>{busy ? "Saving…" : "Update e-mail"}</button>
      </form>
    </section>
  );
}

function DeleteAccount({ isSocial, onDeleted }: { isSocial: boolean; onDeleted: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const ready = confirmText === "DELETE" && (isSocial || password.length > 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setNotice(null);
    setBusy(true);
    try {
      await api.delete("/api/account", {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSocial ? {} : { password }),
      });
      onDeleted();
    } catch (err) {
      setNotice({ kind: "err", text: errMsg(err, "Could not delete account.") });
      setBusy(false);
    }
  }

  return (
    <section className="border border-red-200 bg-surface p-7">
      <h2 className="font-serif text-[1.32rem] font-semibold text-red-700 mb-2">Delete account</h2>
      <p className="text-[14px] font-sans text-muted mb-4">
        Removes your profile, resume, applications, saved jobs and notifications permanently. This cannot be undone.
      </p>
      <form onSubmit={submit} className="space-y-4">
        {!isSocial && (
          <div><label className={label} htmlFor="dpw">Password</label><input id="dpw" type="password" autoComplete="current-password" className={input} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        )}
        <div>
          <label className={label} htmlFor="dcf">Type <span className="font-mono">DELETE</span> to confirm</label>
          <input id="dcf" type="text" className={input} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        </div>
        {notice && <Notice {...notice} />}
        <button type="submit" disabled={!ready || busy}
          className="px-7 py-3 text-[13px] font-sans font-semibold uppercase tracking-[0.18em] text-surface bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {busy ? "Deleting…" : "Delete my account"}
        </button>
      </form>
    </section>
  );
}
