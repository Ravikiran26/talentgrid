"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, X, MapPin, Briefcase, Users, CheckCircle2, ChevronRight, Mail, Phone, Clock, XCircle } from "lucide-react";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatSalary, formatExperience, formatRelativeDate } from "@/lib/utils";
import type { Job } from "@/types";

interface Applicant {
  id: string | number;
  candidateId: string | number;
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
  totalExp?: string;
  headline?: string;
  skills?: string[];
  status: "APPLIED" | "SHORTLISTED" | "REJECTED";
  appliedAt: string;
}

const APP_STATUS = {
  APPLIED:     { label: "Applied",      color: "bg-blue-50 text-blue-700 border-blue-200",    dot: "bg-blue-400",  icon: Clock },
  SHORTLISTED: { label: "Shortlisted",  color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500", icon: CheckCircle2 },
  REJECTED:    { label: "Not Selected", color: "bg-red-50 text-red-600 border-red-200",        dot: "bg-red-400",   icon: XCircle },
};

/* ── Blank job form state ──────────────────────────────────── */
const BLANK: Omit<Job, "id" | "companyLogoInitials" | "postedAt"> = {
  title: "", company: "", location: "", category: "",
  employmentType: "Full-time", experienceMin: 0, experienceMax: 5,
  salaryMin: undefined, salaryMax: undefined,
  skills: [], description: "", openings: 1,
};

const CATEGORIES = ["manager", "coordinator", "analyst", "scrum-master", "pmo", "consultant", "director"];
const LOCATIONS   = ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"];
const EMP_TYPES   = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */
export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs,    setJobs]    = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [showForm,    setShowForm]    = useState(false);
  const [editing,     setEditing]     = useState<Job | null>(null);
  const [deleting,    setDeleting]    = useState<string | null>(null);
  const [applicantsJob, setApplicantsJob] = useState<Job | null>(null);
  const [applicants,    setApplicants]    = useState<Applicant[]>([]);
  const [appsLoading,   setAppsLoading]   = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await api.get<Record<string, unknown>[]>("/api/jobs");
      setJobs(data.map((j) => ({
        id:                  String(j.id),
        title:               String(j.title ?? ""),
        company:             String(j.company ?? ""),
        companyLogoInitials: String(j.companyLogoInitials ?? ""),
        location:            String(j.location ?? ""),
        category:            String(j.category ?? ""),
        employmentType:      String(j.employmentType ?? "Full-time"),
        experienceMin:       Number(j.experienceMin ?? 0),
        experienceMax:       Number(j.experienceMax ?? 0),
        salaryMin:           j.salaryMin != null ? Number(j.salaryMin) : undefined,
        salaryMax:           j.salaryMax != null ? Number(j.salaryMax) : undefined,
        skills:              Array.isArray(j.skills) ? j.skills.map(String) : [],
        description:         j.description != null ? String(j.description) : undefined,
        openings:            j.openings != null ? Number(j.openings) : undefined,
        postedAt:            String(j.postedAt ?? ""),
      })));
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    fetchJobs();
  }, [router, fetchJobs]);

  async function openApplicants(job: Job) {
    setApplicantsJob(job);
    setAppsLoading(true);
    try {
      const data = await api.get<Applicant[]>(`/api/admin/jobs/${job.id}/applications`);
      setApplicants(data);
    } catch {
      setApplicants([]);
    } finally {
      setAppsLoading(false);
    }
  }

  async function updateAppStatus(appId: string | number, status: "SHORTLISTED" | "REJECTED") {
    try {
      await api.patch(`/api/admin/applications/${appId}/status`, { status });
      setApplicants((prev) =>
        prev.map((a) => String(a.id) === String(appId) ? { ...a, status } : a)
      );
    } catch { /* ignore */ }
  }

  async function handleDelete(id: string) {
    try {
      await api.patch(`/api/jobs/${id}/deactivate`, {});
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch {
      // silently ignore
    } finally {
      setDeleting(null);
    }
  }

  const filtered = jobs.filter((j) => {
    const kw = search.toLowerCase();
    return !search ||
      j.title.toLowerCase().includes(kw) ||
      j.company.toLowerCase().includes(kw) ||
      j.location.toLowerCase().includes(kw) ||
      j.category.toLowerCase().includes(kw);
  });

  if (loading) {
    return (
      <div className="bg-ivory min-h-screen flex items-center justify-center">
        <p className="text-[13px] font-sans text-muted">Loading jobs…</p>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen">

      {/* Page header */}
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div>
            <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-1">
              Admin Dashboard
            </p>
            <h1 className="font-serif text-2xl font-bold text-surface">Job Opportunities</h1>
            <p className="text-[13px] font-sans text-[#8A9DB5] mt-1">
              {jobs.length} active {jobs.length === 1 ? "listing" : "listings"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 text-[11px] font-sans font-semibold uppercase tracking-[0.18em] bg-brass text-navy px-6 py-3 hover:bg-brass/90 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Post New Job
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, company, location…"
            className="w-full pl-11 pr-4 py-3 text-[13px] font-sans text-charcoal placeholder-muted bg-surface border border-border focus:outline-none focus:border-navy transition-colors"
          />
        </div>

        {/* Jobs table */}
        {filtered.length > 0 ? (
          <div className="bg-surface border border-border">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-ivory">
              <p className="col-span-4 text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-muted">Role</p>
              <p className="col-span-2 text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-muted">Location</p>
              <p className="col-span-2 text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-muted">Experience</p>
              <p className="col-span-2 text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-muted">Salary</p>
              <p className="col-span-2 text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-muted text-right">Actions</p>
            </div>

            {filtered.map((j) => (
              <div key={j.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 px-6 py-5 border-b border-border last:border-b-0 hover:bg-[#FDFAF6] transition-colors items-center">

                {/* Role info */}
                <div className="md:col-span-4">
                  <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-brass mb-0.5 capitalize">{j.category}</p>
                  <p className="font-serif text-[1rem] font-semibold text-navy leading-snug">{j.title}</p>
                  <p className="text-[12px] font-sans text-muted mt-0.5">{j.company}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[10px] font-sans border border-border px-2 py-0.5 text-muted">{j.employmentType}</span>
                    {j.openings && (
                      <span className="text-[10px] font-sans border border-border px-2 py-0.5 text-muted flex items-center gap-1">
                        <Users className="w-3 h-3" />{j.openings} opening{j.openings > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <p className="flex items-center gap-1.5 text-[12px] font-sans text-muted">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />{j.location}
                  </p>
                </div>

                {/* Experience */}
                <div className="md:col-span-2">
                  <p className="flex items-center gap-1.5 text-[12px] font-sans text-muted">
                    <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                    {formatExperience(j.experienceMin, j.experienceMax)}
                  </p>
                </div>

                {/* Salary */}
                <div className="md:col-span-2">
                  <p className="text-[12px] font-sans text-muted">
                    {formatSalary(j.salaryMin, j.salaryMax)}
                  </p>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex items-center justify-end gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => openApplicants(j)}
                    className="flex items-center gap-1.5 text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-brass border border-brass/40 px-3 py-2 hover:bg-brass/10 transition-colors"
                  >
                    <Users className="w-3 h-3" /> Applicants
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditing(j); setShowForm(true); }}
                    className="flex items-center gap-1.5 text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-navy border border-border px-3 py-2 hover:border-navy hover:bg-ivory transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(j.id)}
                    className="flex items-center gap-1.5 text-[11px] font-sans font-semibold uppercase tracking-[0.14em] text-red-500 border border-red-200 px-3 py-2 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-surface border border-border">
            <p className="text-[13px] font-sans text-muted">
              {jobs.length === 0 ? "No jobs posted yet. Use the Post New Job button to add one." : "No jobs match your search."}
            </p>
          </div>
        )}
      </div>

      {/* ── Applicants panel ── */}
      {applicantsJob && (
        <ApplicantsPanel
          job={applicantsJob}
          applicants={applicants}
          loading={appsLoading}
          onClose={() => { setApplicantsJob(null); setApplicants([]); }}
          onStatusChange={updateAppStatus}
        />
      )}

      {/* ── Job form modal ── */}
      {showForm && (
        <JobFormModal
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); fetchJobs(); }}
        />
      )}

      {/* ── Delete confirm ── */}
      {deleting && (
        <div className="fixed inset-0 bg-navy/50 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className="bg-surface w-full max-w-sm p-8 border border-border">
            <h3 className="font-serif text-xl font-bold text-navy mb-2">Remove this job?</h3>
            <p className="text-[13px] font-sans text-muted mb-6">This will deactivate the listing. Candidates already applied won't be affected.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => handleDelete(deleting)}
                className="flex-1 py-2.5 text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-surface bg-red-600 hover:bg-red-700 transition-colors">
                Remove
              </button>
              <button type="button" onClick={() => setDeleting(null)}
                className="flex-1 py-2.5 text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-charcoal border border-border hover:bg-ivory transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Applicants panel ───────────────────────────────────────── */
function ApplicantsPanel({ job, applicants, loading, onClose, onStatusChange }: {
  job: Job;
  applicants: Applicant[];
  loading: boolean;
  onClose: () => void;
  onStatusChange: (id: string | number, status: "SHORTLISTED" | "REJECTED") => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-navy/50 z-40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-surface z-50 overflow-y-auto"
        style={{ boxShadow: "-8px 0 40px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div className="sticky top-0 bg-navy z-10 border-b border-navy-border">
          <div className="h-[2px] bg-brass" />
          <div className="px-8 py-5 flex items-start justify-between">
            <div>
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-0.5">Applicants</p>
              <h2 className="font-serif text-lg font-bold text-surface leading-tight">{job.title}</h2>
              <p className="text-[11px] font-sans text-[#8A9DB5] mt-0.5">{job.company}</p>
            </div>
            <button type="button" onClick={onClose} className="text-[#8A9DB5] hover:text-surface transition-colors mt-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-8 py-6">
          {loading ? (
            <p className="text-[13px] font-sans text-muted text-center py-12">Loading applicants…</p>
          ) : applicants.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-8 h-8 text-muted mx-auto mb-3" />
              <p className="text-[13px] font-sans text-muted">No applications yet for this role.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[11px] font-sans text-muted">{applicants.length} {applicants.length === 1 ? "applicant" : "applicants"}</p>
              {applicants.map((a) => {
                const cfg = APP_STATUS[a.status];
                return (
                  <div key={a.id} className="border border-border bg-ivory p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-sans font-bold text-brass">
                            {a.fullName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-serif text-[0.95rem] font-bold text-navy leading-tight">{a.fullName}</p>
                          {a.headline && <p className="text-[11px] font-sans text-muted mt-0.5 line-clamp-1">{a.headline}</p>}
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 text-[10px] font-sans font-semibold px-2 py-1 border flex-shrink-0 ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-sans text-muted mb-3">
                      {a.email && (
                        <a href={`mailto:${a.email}`} className="flex items-center gap-1.5 hover:text-navy transition-colors">
                          <Mail className="w-3 h-3" />{a.email}
                        </a>
                      )}
                      {a.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{a.phone}</span>}
                      {a.city && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{a.city}</span>}
                      {a.totalExp && <span className="flex items-center gap-1.5"><Briefcase className="w-3 h-3" />{a.totalExp}</span>}
                    </div>

                    {(a.skills ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(a.skills ?? []).slice(0, 4).map((s) => (
                          <span key={s} className="text-[9px] font-sans text-muted border border-border px-2 py-0.5">{s}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-[10px] font-sans text-muted">Applied {formatRelativeDate(a.appliedAt)}</span>
                      {a.status === "APPLIED" && (
                        <div className="flex gap-2">
                          <button type="button"
                            onClick={() => onStatusChange(a.id, "SHORTLISTED")}
                            className="text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-green-700 border border-green-300 px-3 py-1.5 hover:bg-green-50 transition-colors">
                            Shortlist
                          </button>
                          <button type="button"
                            onClick={() => onStatusChange(a.id, "REJECTED")}
                            className="text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-red-600 border border-red-200 px-3 py-1.5 hover:bg-red-50 transition-colors">
                            Reject
                          </button>
                        </div>
                      )}
                      {a.status !== "APPLIED" && (
                        <button type="button"
                          onClick={() => onStatusChange(a.id, a.status === "SHORTLISTED" ? "REJECTED" : "SHORTLISTED")}
                          className="text-[10px] font-sans text-muted hover:text-navy transition-colors flex items-center gap-1">
                          Change <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Job form modal ─────────────────────────────────────────── */
function JobFormModal({ initial, onClose, onSaved }: {
  initial: Job | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title:          initial?.title          ?? BLANK.title,
    company:        initial?.company        ?? BLANK.company,
    location:       initial?.location       ?? BLANK.location,
    category:       initial?.category       ?? BLANK.category,
    employmentType: initial?.employmentType ?? BLANK.employmentType,
    experienceMin:  initial?.experienceMin  ?? BLANK.experienceMin,
    experienceMax:  initial?.experienceMax  ?? BLANK.experienceMax,
    salaryMin:      initial?.salaryMin      ?? "",
    salaryMax:      initial?.salaryMax      ?? "",
    description:    initial?.description    ?? BLANK.description,
    openings:       initial?.openings       ?? BLANK.openings,
    skillsRaw:      (initial?.skills ?? []).join(", "),
  });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);

  function set(key: string, val: unknown) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title:          form.title,
      company:        form.company,
      location:       form.location,
      category:       form.category,
      employmentType: form.employmentType,
      experienceMin:  Number(form.experienceMin),
      experienceMax:  Number(form.experienceMax),
      salaryMin:      form.salaryMin !== "" ? Number(form.salaryMin) : null,
      salaryMax:      form.salaryMax !== "" ? Number(form.salaryMax) : null,
      description:    form.description,
      openings:       Number(form.openings),
      skills:         form.skillsRaw.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (initial) {
        await api.patch(`/api/jobs/${initial.id}`, payload);
      } else {
        await api.post("/api/jobs", payload);
      }
      setSuccess(true);
      setTimeout(onSaved, 900);
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-navy/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-[2px]">
      <div className="bg-surface w-full sm:max-w-[640px] sm:mx-4 max-h-[90vh] overflow-y-auto border border-border"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>

        {/* Modal header */}
        <div className="sticky top-0 bg-navy z-10">
          <div className="h-[2px] bg-brass" />
          <div className="px-8 py-5 flex items-center justify-between border-b border-navy-border">
            <div>
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-0.5">Admin</p>
              <h2 className="font-serif text-lg font-bold text-surface">
                {initial ? "Edit Job Listing" : "Post New Opportunity"}
              </h2>
            </div>
            <button type="button" onClick={onClose} className="text-[#8A9DB5] hover:text-surface transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {success ? (
          <div className="px-8 py-16 flex flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <p className="font-serif text-xl font-bold text-navy mb-1">
              {initial ? "Job Updated!" : "Job Posted!"}
            </p>
            <p className="text-[13px] font-sans text-muted">Listing is now live on TalentGrid.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Job Title *">
                <input required value={form.title} onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Senior Project Manager"
                  className="w-full px-4 py-2.5 text-[13px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal placeholder-muted" />
              </Field>
              <Field label="Company *">
                <input required value={form.company} onChange={(e) => set("company", e.target.value)}
                  placeholder="e.g. Infosys"
                  className="w-full px-4 py-2.5 text-[13px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal placeholder-muted" />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Location *">
                <select required value={form.location} onChange={(e) => set("location", e.target.value)}
                  className="w-full px-4 py-2.5 text-[13px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal">
                  <option value="">Select city</option>
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Category *">
                <select required value={form.category} onChange={(e) => set("category", e.target.value)}
                  className="w-full px-4 py-2.5 text-[13px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal capitalize">
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Employment Type">
                <select value={form.employmentType} onChange={(e) => set("employmentType", e.target.value)}
                  className="w-full px-4 py-2.5 text-[13px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal">
                  {EMP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Min Exp (yrs)">
                <input type="number" min={0} max={30} value={form.experienceMin}
                  onChange={(e) => set("experienceMin", e.target.value)}
                  className="w-full px-4 py-2.5 text-[13px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal" />
              </Field>
              <Field label="Max Exp (yrs)">
                <input type="number" min={0} max={30} value={form.experienceMax}
                  onChange={(e) => set("experienceMax", e.target.value)}
                  className="w-full px-4 py-2.5 text-[13px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal" />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Salary Min (LPA)">
                <input type="number" min={0} value={form.salaryMin}
                  onChange={(e) => set("salaryMin", e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full px-4 py-2.5 text-[13px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal placeholder-muted" />
              </Field>
              <Field label="Salary Max (LPA)">
                <input type="number" min={0} value={form.salaryMax}
                  onChange={(e) => set("salaryMax", e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full px-4 py-2.5 text-[13px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal placeholder-muted" />
              </Field>
              <Field label="Openings">
                <input type="number" min={1} value={form.openings}
                  onChange={(e) => set("openings", e.target.value)}
                  className="w-full px-4 py-2.5 text-[13px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal" />
              </Field>
            </div>

            <Field label="Skills (comma-separated)">
              <input value={form.skillsRaw} onChange={(e) => set("skillsRaw", e.target.value)}
                placeholder="e.g. Agile, PMP, JIRA, Stakeholder Management"
                className="w-full px-4 py-2.5 text-[13px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal placeholder-muted" />
            </Field>

            <Field label="Job Description">
              <textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the role, responsibilities, and what you're looking for…"
                className="w-full px-4 py-2.5 text-[13px] font-sans border border-border bg-surface focus:outline-none focus:border-navy text-charcoal placeholder-muted resize-none" />
            </Field>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-3 text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-navy bg-brass hover:bg-brass/90 disabled:opacity-60 transition-colors">
                {saving ? "Saving…" : initial ? "Save Changes" : "Post Opportunity"}
              </button>
              <button type="button" onClick={onClose}
                className="px-6 py-3 text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-muted border border-border hover:bg-ivory transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-muted mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
