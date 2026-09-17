"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Search, Pencil, Trash2, X, MapPin, Briefcase,
  Users, CheckCircle2, RotateCcw, AlertCircle, Building2,
} from "lucide-react";
import { getUser, type AuthUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { normalizeJob } from "@/lib/jobs";
import { fetchMyCompany, type CompanyProfile } from "@/lib/company";
import { formatSalary, formatExperience } from "@/lib/utils";
import type { Job } from "@/types";

/* ── Types ─────────────────────────────────────────────────── */
const CATEGORIES = ["manager", "coordinator", "analyst", "scrum-master", "pmo", "consultant", "director"];
const LOCATIONS   = ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"];
const EMP_TYPES   = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */
export default function EmployerDashboard() {
  const router = useRouter();
  const [jobs,    setJobs]    = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [showForm,    setShowForm]    = useState(false);
  const [editing,     setEditing]     = useState<Job | null>(null);
  const [deleting,    setDeleting]    = useState<string | null>(null);
  const [me,        setMe]        = useState<AuthUser | null>(null);
  const [company,   setCompany]   = useState<CompanyProfile | null | undefined>(undefined);
  const [view,      setView]      = useState<"open" | "closed" | "all">("open");
  const [actionErr, setActionErr] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await api.get<Record<string, unknown>[]>("/api/employer/jobs?size=100&sort=postedAt,desc");
      setJobs(data.map(normalizeJob));
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "EMPLOYER") { router.push("/"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
    api.get<AuthUser>("/api/auth/me").then(setMe).catch(() => setMe(u));
    fetchMyCompany().then(setCompany).catch(() => setCompany(null));
  }, [router, fetchJobs]);

  const verified = me?.status === "ACTIVE";

  function openApplicants(job: Job) {
    router.push(`/employer/jobs/${job.id}/applicants`);
  }

  async function handleDeactivate(id: string) {
    try {
      await api.patch(`/api/employer/jobs/${id}/deactivate`, {});
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, active: false } : j)));
    } catch { /* ignore */ } finally {
      setDeleting(null);
    }
  }

  async function handleReopen(id: string) {
    setActionErr(null);
    try {
      await api.patch(`/api/employer/jobs/${id}/reactivate`, {});
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, active: true } : j)));
    } catch (err) {
      setActionErr(err instanceof Error ? err.message : "Could not reopen this job.");
    }
  }

  const openCount = jobs.filter((j) => j.active !== false).length;
  const filtered = jobs.filter((j) => {
    if (view === "open" && j.active === false) return false;
    if (view === "closed" && j.active !== false) return false;
    const kw = search.toLowerCase();
    return !search ||
      j.title.toLowerCase().includes(kw) ||
      j.company.toLowerCase().includes(kw) ||
      j.location.toLowerCase().includes(kw);
  });

  const user = me ?? getUser();

  if (loading) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <p className="text-[15px] font-sans text-muted">Loading your jobs…</p>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen">

      {/* Page header */}
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div>
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-1">
              Employer Dashboard
            </p>
            <h1 className="font-serif text-3xl font-bold text-surface">My Job Listings</h1>
            <p className="text-[15px] font-sans text-navy-text mt-1">
              {company?.name ?? user?.fullName} · {openCount} open {openCount === 1 ? "listing" : "listings"}
            </p>
          </div>
          <button type="button"
            disabled={!verified}
            title={verified ? undefined : "Available once your account is verified"}
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 text-[13px] font-sans font-semibold uppercase tracking-[0.18em] bg-brass text-navy px-6 py-3 hover:bg-brass/90 transition-colors self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed">
            <Plus className="w-4 h-4" /> Post New Job
          </button>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8">

        {/* Account state banners */}
        {me && me.status !== "ACTIVE" && (
          <div className={`mb-6 flex items-start gap-3 px-5 py-4 border text-[15px] font-sans ${
            me.status === "REJECTED" ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              {me.status === "REJECTED"
                ? "Your company account was not approved. Contact TalentGrid if you believe this is a mistake."
                : "Your company account is pending verification. You can prepare your company profile now and post roles as soon as an administrator approves you."}
            </p>
          </div>
        )}
        {company === null && (
          <div className="mb-6 flex items-center justify-between gap-4 px-5 py-4 bg-surface border border-brass/40 text-[15px] font-sans text-charcoal">
            <p className="flex items-center gap-2"><Building2 className="w-4 h-4 text-brass" /> Add your company profile so candidates see who is hiring.</p>
            <Link href="/employer/company" className="text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass whitespace-nowrap">Set up →</Link>
          </div>
        )}
        {actionErr && (
          <p className="mb-6 flex items-center gap-2 text-[14px] font-sans text-red-600 bg-red-50 border border-red-200 px-4 py-3">
            <AlertCircle className="w-4 h-4" />{actionErr}
          </p>
        )}

        {/* View tabs */}
        <div className="flex items-center gap-2 mb-5">
          {(["open", "closed", "all"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)}
              className={`text-[12px] font-sans font-semibold uppercase tracking-[0.16em] px-4 py-2 border transition-colors ${
                view === v ? "bg-navy border-navy text-surface" : "border-border text-muted hover:border-navy/40 hover:text-charcoal"}`}>
              {v === "open" ? `Open (${openCount})` : v === "closed" ? `Closed (${jobs.length - openCount})` : `All (${jobs.length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location…"
            className="w-full pl-11 pr-4 py-3 text-[15px] font-sans text-charcoal placeholder-muted bg-surface border border-border focus:outline-none focus:border-navy transition-colors" />
        </div>

        {filtered.length > 0 ? (
          <div className="bg-surface border border-border">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-ivory">
              <p className="col-span-5 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-muted">Role</p>
              <p className="col-span-2 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-muted">Location</p>
              <p className="col-span-2 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-muted">Exp / Salary</p>
              <p className="col-span-3 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-muted text-right">Actions</p>
            </div>

            {filtered.map((j) => (
              <div key={j.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 px-6 py-5 border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors items-center">

                <div className="md:col-span-5">
                  <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-brass mb-0.5 capitalize">{j.category}</p>
                  <p className="font-serif text-[1.1rem] font-semibold text-navy leading-snug">{j.title}</p>
                  <p className="text-[14px] font-sans text-muted mt-0.5">{j.company}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className={`text-[12px] font-sans font-semibold uppercase tracking-[0.12em] px-2 py-0.5 border ${
                      j.active === false ? "text-muted border-border" : "text-green-700 border-green-200 bg-green-50"}`}>
                      {j.active === false ? "Closed" : "Open"}
                    </span>
                    <span className="text-[12px] font-sans border border-border px-2 py-0.5 text-muted">{j.employmentType}</span>
                    {j.openings && (
                      <span className="text-[12px] font-sans border border-border px-2 py-0.5 text-muted flex items-center gap-1">
                        <Users className="w-3 h-3" />{j.openings} opening{j.openings > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="flex items-center gap-1.5 text-[14px] font-sans text-muted">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />{j.location}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <p className="flex items-center gap-1.5 text-[14px] font-sans text-muted">
                    <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />{formatExperience(j.experienceMin, j.experienceMax)}
                  </p>
                  <p className="text-[14px] font-sans text-muted">{formatSalary(j.salaryMin, j.salaryMax)}</p>
                </div>

                <div className="md:col-span-3 flex items-center justify-end gap-2 flex-wrap">
                  <button type="button" onClick={() => openApplicants(j)}
                    className="flex items-center gap-1.5 text-[13px] font-sans font-semibold uppercase tracking-[0.14em] text-brass border border-brass/40 px-3 py-2 hover:bg-brass/10 transition-colors">
                    <Users className="w-3 h-3" /> Applicants{j.applicantCount != null ? ` (${j.applicantCount})` : ""}
                  </button>
                  {j.active === false ? (
                    <button type="button" onClick={() => handleReopen(j.id)} disabled={!verified}
                      className="flex items-center gap-1.5 text-[13px] font-sans font-semibold uppercase tracking-[0.14em] text-green-700 border border-green-300 px-3 py-2 hover:bg-green-50 transition-colors disabled:opacity-50">
                      <RotateCcw className="w-3 h-3" /> Reopen
                    </button>
                  ) : (
                    <>
                      <button type="button" onClick={() => { setEditing(j); setShowForm(true); }} disabled={!verified}
                        className="flex items-center gap-1.5 text-[13px] font-sans font-semibold uppercase tracking-[0.14em] text-navy border border-border px-3 py-2 hover:bg-ivory transition-colors disabled:opacity-50">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={() => setDeleting(j.id)}
                        className="flex items-center gap-1.5 text-[13px] font-sans font-semibold uppercase tracking-[0.14em] text-red-500 border border-red-200 px-3 py-2 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-surface border border-border">
            <p className="text-[15px] font-sans text-muted">
              {jobs.length === 0 ? "No jobs posted yet. Use the Post New Job button above." : view === "closed" ? "No closed jobs." : "No jobs match your search."}
            </p>
          </div>
        )}
      </div>

      {/* Job form modal */}
      {showForm && (
        <JobFormModal
          initial={editing}
          companyName={company?.name ?? null}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchJobs(); }}
        />
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 bg-navy/50 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className="bg-surface w-full max-w-sm p-8 border border-border">
            <h3 className="font-serif text-2xl font-bold text-navy mb-2">Close this job?</h3>
            <p className="text-[15px] font-sans text-muted mb-6">Candidates will no longer see it. You can reopen it later from the Closed tab.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => handleDeactivate(deleting)}
                className="flex-1 py-2.5 text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-surface bg-red-600 hover:bg-red-700 transition-colors">
                Close listing
              </button>
              <button type="button" onClick={() => setDeleting(null)}
                className="flex-1 py-2.5 text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-charcoal border border-border hover:bg-ivory transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ── Job form modal ─────────────────────────────────────────── */
function JobFormModal({ initial, companyName, onClose, onSaved }: {
  initial: Job | null; companyName: string | null; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title:          initial?.title          ?? "",
    company:        companyName ?? initial?.company ?? "",
    location:       initial?.location       ?? "",
    category:       initial?.category       ?? "",
    employmentType: initial?.employmentType ?? "Full-time",
    experienceMin:  initial?.experienceMin  ?? 0,
    experienceMax:  initial?.experienceMax  ?? 5,
    salaryMin:      initial?.salaryMin      ?? "",
    salaryMax:      initial?.salaryMax      ?? "",
    description:    initial?.description    ?? "",
    openings:       initial?.openings       ?? 1,
    skillsRaw:      (initial?.skills ?? []).join(", "),
  });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  function set(key: string, val: unknown) { setForm((p) => ({ ...p, [key]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      title: form.title, company: form.company, location: form.location,
      category: form.category, employmentType: form.employmentType,
      experienceMin: Number(form.experienceMin), experienceMax: Number(form.experienceMax),
      salaryMin: form.salaryMin !== "" ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax !== "" ? Number(form.salaryMax) : null,
      description: form.description, openings: Number(form.openings),
      skills: form.skillsRaw.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (initial) {
        await api.patch(`/api/employer/jobs/${initial.id}`, payload);
      } else {
        await api.post("/api/employer/jobs", payload);
      }
      setSuccess(true);
      setTimeout(onSaved, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the job.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-navy/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-[2px]">
      <div className="bg-surface w-full sm:max-w-[620px] sm:mx-4 max-h-[90vh] overflow-y-auto border border-border"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>

        <div className="sticky top-0 bg-navy z-10">
          <div className="h-[2px] bg-brass" />
          <div className="px-8 py-5 flex items-center justify-between border-b border-navy-border">
            <div>
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-0.5">Employer</p>
              <h2 className="font-serif text-xl font-bold text-surface">
                {initial ? "Edit Job Listing" : "Post New Opportunity"}
              </h2>
            </div>
            <button type="button" onClick={onClose} className="text-navy-text hover:text-surface transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {success ? (
          <div className="px-8 py-16 flex flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <p className="font-serif text-2xl font-bold text-navy mb-1">{initial ? "Job Updated!" : "Job Posted!"}</p>
            <p className="text-[15px] font-sans text-muted">Your listing is now live on TalentGrid.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            {error && (
              <p className="flex items-center gap-2 text-[14px] font-sans text-red-600 bg-red-50 border border-red-200 px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <F label="Job Title *"><input required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Senior Project Manager" className={inp} /></F>
              <F label={companyName ? "Company (from profile)" : "Company *"}>
                <input required readOnly={!!companyName} value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="e.g. Infosys"
                  className={`${inp} ${companyName ? "bg-ivory text-muted cursor-not-allowed" : ""}`} />
              </F>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <F label="Location *">
                <select required value={form.location} onChange={(e) => set("location", e.target.value)} className={inp}>
                  <option value="">Select city</option>
                  {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </F>
              <F label="Category *">
                <select required value={form.category} onChange={(e) => set("category", e.target.value)} className={`${inp} capitalize`}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </F>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <F label="Employment Type">
                <select value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)} className={inp}>
                  {EMP_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </F>
              <F label="Min Exp (yrs)"><input type="number" min={0} max={30} value={form.experienceMin} onChange={(e) => set("experienceMin", e.target.value)} className={inp} /></F>
              <F label="Max Exp (yrs)"><input type="number" min={0} max={30} value={form.experienceMax} onChange={(e) => set("experienceMax", e.target.value)} className={inp} /></F>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <F label="Salary Min (LPA)"><input type="number" min={0} value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} placeholder="e.g. 15" className={inp} /></F>
              <F label="Salary Max (LPA)"><input type="number" min={0} value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} placeholder="e.g. 25" className={inp} /></F>
              <F label="Openings"><input type="number" min={1} value={form.openings} onChange={(e) => set("openings", e.target.value)} className={inp} /></F>
            </div>
            <F label="Skills (comma-separated)"><input value={form.skillsRaw} onChange={(e) => set("skillsRaw", e.target.value)} placeholder="e.g. Agile, PMP, JIRA" className={inp} /></F>
            <F label="Job Description"><textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the role…" className={`${inp} resize-none`} /></F>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-3 text-[13px] font-sans font-semibold uppercase tracking-[0.18em] text-navy bg-brass hover:bg-brass/90 disabled:opacity-60 transition-colors">
                {saving ? "Saving…" : initial ? "Save Changes" : "Post Opportunity"}
              </button>
              <button type="button" onClick={onClose}
                className="px-6 py-3 text-[13px] font-sans font-semibold uppercase tracking-[0.18em] text-muted border border-border hover:bg-ivory transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inp = "w-full px-4 py-2.5 text-[15px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal placeholder-muted";

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-muted mb-1.5">{label}</label>
      {children}
    </div>
  );
}
