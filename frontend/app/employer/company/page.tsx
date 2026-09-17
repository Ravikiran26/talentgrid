"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { getUser } from "@/lib/auth";
import { fetchMyCompany, saveMyCompany, type CompanyForm } from "@/lib/company";

const SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
const BLANK: CompanyForm = { name: "", website: "", industry: "", size: "", city: "", description: "" };
const inp = "w-full px-4 py-2.5 text-[15px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal placeholder-muted";
const lbl = "block text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-muted mb-1.5";

export default function EmployerCompanyPage() {
  const router = useRouter();
  const [form, setForm] = useState<CompanyForm>(BLANK);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "EMPLOYER") { router.push("/"); return; }
    fetchMyCompany()
      .then((c) => {
        if (c) {
          setCompanyId(c.id);
          setForm({
            name: c.name, website: c.website ?? "", industry: c.industry ?? "",
            size: c.size ?? "", city: c.city ?? "", description: c.description ?? "",
          });
        }
      })
      .catch(() => {/* first visit */})
      .finally(() => setLoading(false));
  }, [router]);

  const set = (k: keyof CompanyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setNotice(null);
    try {
      const c = await saveMyCompany(form);
      setCompanyId(c.id);
      setNotice({ ok: true, text: "Company profile saved. New jobs will use this name and description." });
    } catch (err) {
      setNotice({ ok: false, text: err instanceof Error ? err.message : "Could not save." });
    } finally { setSaving(false); }
  }

  if (loading) return <div className="min-h-screen bg-ivory" aria-busy="true" />;

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-1">Employer</p>
            <h1 className="font-serif text-3xl font-bold text-surface">Company Profile</h1>
            <p className="text-[15px] font-sans text-navy-text mt-1">Shown to candidates on every role you post.</p>
          </div>
          {companyId && (
            <Link href={`/companies/${companyId}`} target="_blank"
              className="inline-flex items-center gap-2 text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-brass border border-brass/50 px-4 py-2 hover:bg-brass/10 transition-colors self-start">
              View public page <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-10">
        <form onSubmit={submit} className="bg-surface border border-border p-8 space-y-5">
          {notice && (
            <p className={`flex items-center gap-2 text-[14px] font-sans px-4 py-3 border ${notice.ok ? "text-green-700 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>
              {notice.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{notice.text}
            </p>
          )}
          <div><label className={lbl}>Company name *</label><input required className={inp} value={form.name} onChange={set("name")} placeholder="e.g. Infosys" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={lbl}>Website</label><input className={inp} value={form.website} onChange={set("website")} placeholder="https://" /></div>
            <div><label className={lbl}>Industry</label><input className={inp} value={form.industry} onChange={set("industry")} placeholder="e.g. IT Services" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Company size</label>
              <select className={inp} value={form.size} onChange={set("size")}>
                <option value="">Select</option>
                {SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </div>
            <div><label className={lbl}>Headquarters</label><input className={inp} value={form.city} onChange={set("city")} placeholder="e.g. Bengaluru" /></div>
          </div>
          <div>
            <label className={lbl}>About the company</label>
            <textarea rows={6} className={`${inp} resize-none`} value={form.description} onChange={set("description")} placeholder="What you do, your culture, and why PM professionals should join." />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="px-8 py-3 text-[13px] font-sans font-semibold uppercase tracking-[0.18em] text-navy bg-brass hover:bg-brass/90 disabled:opacity-60 transition-colors">
              {saving ? "Saving…" : companyId ? "Save changes" : "Create profile"}
            </button>
            <Link href="/employer/dashboard" className="text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-muted hover:text-navy transition-colors">Back to dashboard</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
