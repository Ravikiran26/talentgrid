"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera, Upload, Plus, X, CheckCircle2,
  Briefcase, GraduationCap, User, FileText, ChevronDown
} from "lucide-react";
import { getUser, type AuthUser } from "@/lib/auth";
import { api } from "@/lib/api";

/* ── Types ─────────────────────────────────────────────────── */
interface WorkExperience {
  id: string; company: string; title: string;
  startMonth: string; startYear: string;
  endMonth: string;   endYear: string; current: boolean;
  description: string;
}
interface Education {
  id: string; institution: string; degree: string;
  field: string; startYear: string; endYear: string;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const YEARS  = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));
const NOTICE = ["Immediate","15 days","1 month","2 months","3 months","Currently serving notice"];
const EXP_LEVELS = ["Fresher (0 yrs)","1–2 years","3–5 years","6–10 years","10+ years"];
const LOCATIONS  = ["Bengaluru","Hyderabad","Mumbai","Delhi NCR","Pune","Chennai","Kolkata","Ahmedabad","Remote"];
const EMPLOYMENT_TYPES = ["Full-time","Part-time","Contract","Freelance","Internship"];
const SKILL_SUGGESTIONS = [
  "Agile","Scrum","JIRA","MS Project","Confluence","Stakeholder Management",
  "Risk Management","Budgeting","PMP","Prince2","SAFe","Kanban","Waterfall",
  "PMO","Program Management","Change Management","RAID","Resource Planning",
];

/* ── Helpers ─────────────────────────────────────────────────── */
function uid() { return Math.random().toString(36).slice(2); }

/** Extract minimum years from a bucket label like "3–5 years" → 3, "10+ years" → 10. */
function expYearsFor(bucket: string): number | null {
  if (!bucket) return null;
  const m = bucket.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

/** Reverse — pick the closest bucket for a numeric years value. */
function expBucketFor(years: number): string {
  if (years <= 0) return EXP_LEVELS[0];
  if (years <= 2) return EXP_LEVELS[1];
  if (years <= 5) return EXP_LEVELS[2];
  if (years <= 10) return EXP_LEVELS[3];
  return EXP_LEVELS[4];
}

/* ── Subcomponents ─────────────────────────────────────────── */
function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-4 mb-8 pb-6 border-b border-border">
      <div className="w-9 h-9 bg-navy flex items-center justify-center flex-shrink-0">
        <span className="text-brass">{icon}</span>
      </div>
      <div>
        <h2 className="font-serif text-lg font-bold text-navy">{title}</h2>
        {subtitle && <p className="text-[12px] font-sans text-muted mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-muted mb-1.5">
      {children}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

const inputCls = "w-full px-4 py-3 text-[13px] font-sans text-charcoal placeholder-[#B5AFA6] bg-surface border border-border focus:outline-none focus:border-navy transition-colors duration-150";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const router = useRouter();
  const [user] = useState<AuthUser | null>(() =>
    typeof window !== "undefined" ? getUser() : null
  );
  const [saved,           setSaved]           = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [activeSection,   setActiveSection]   = useState("basic");
  const [profileStrength, setProfileStrength] = useState(0);
  const [canApply,        setCanApply]        = useState(false);

  /* Photo */
  const photoRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  /* Resume */
  const resumeRef = useRef<HTMLInputElement>(null);
  const [resumeFile,        setResumeFile]        = useState<File | null>(null);
  const [existingResume,    setExistingResume]    = useState<string | null>(null);
  const [resumeUploading,   setResumeUploading]   = useState(false);
  const [resumeError,       setResumeError]       = useState<string | null>(null);

  /* Basic info */
  const [headline,     setHeadline]     = useState("");
  const [phone,        setPhone]        = useState("");
  const [city,         setCity]         = useState("");
  const [dob,          setDob]          = useState("");
  const [gender,       setGender]       = useState("");
  const [about,        setAbout]        = useState("");

  /* Professional */
  const [currentTitle,  setCurrentTitle]  = useState("");
  const [currentCompany,setCurrentCompany]= useState("");
  const [expLevel,      setExpLevel]      = useState("");
  const [salaryMin,     setSalaryMin]     = useState("");
  const [salaryMax,     setSalaryMax]     = useState("");
  const [noticePeriod,  setNoticePeriod]  = useState("");
  const [empTypes,      setEmpTypes]      = useState<string[]>([]);
  const [prefLocations, setPrefLocations] = useState<string[]>([]);

  /* Skills */
  const [skills,     setSkills]     = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  /* Experience */
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);

  /* Education */
  const [educations, setEducations] = useState<Education[]>([]);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get<{
      headline?: string; phone?: string; city?: string;
      totalExp?: number; about?: string; skills?: string[];
      profileStrength?: number; canApply?: boolean;
      hasResume?: boolean; resumeFileName?: string | null;
    }>("/api/profile/me")
      .then((p) => {
        if (p.headline)  setHeadline(p.headline);
        if (p.phone)     setPhone(p.phone.replace(/^\+91\s?/, ""));
        if (p.city)      setCity(p.city);
        if (typeof p.totalExp === "number") setExpLevel(expBucketFor(p.totalExp));
        if (p.about)     setAbout(p.about);
        if (p.skills?.length) setSkills(p.skills);
        setProfileStrength(p.profileStrength ?? 0);
        setCanApply(p.canApply ?? false);
        if (p.hasResume && p.resumeFileName) setExistingResume(p.resumeFileName);
      })
      .catch(() => {/* not yet saved — keep empty form */});
  }, [user, router]);

  /* ── Photo handler ── */
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  /* ── Skills ── */
  function addSkill(skill: string) {
    const s = skill.trim();
    if (s && !skills.includes(s)) setSkills((p) => [...p, s]);
    setSkillInput("");
  }
  function removeSkill(s: string) { setSkills((p) => p.filter((x) => x !== s)); }

  /* ── Multi-select toggle ── */
  function toggle<T>(arr: T[], val: T, set: (v: T[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  /* ── Experience ── */
  function addExp() {
    setExperiences((p) => [...p, {
      id: uid(), company: "", title: "", startMonth: "", startYear: "",
      endMonth: "", endYear: "", current: false, description: "",
    }]);
  }
  function updExp(id: string, k: keyof WorkExperience, v: string | boolean) {
    setExperiences((p) => p.map((e) => e.id === id ? { ...e, [k]: v } : e));
  }
  function removeExp(id: string) { setExperiences((p) => p.filter((e) => e.id !== id)); }

  /* ── Education ── */
  function addEdu() {
    setEducations((p) => [...p, { id: uid(), institution: "", degree: "", field: "", startYear: "", endYear: "" }]);
  }
  function updEdu(id: string, k: keyof Education, v: string) {
    setEducations((p) => p.map((e) => e.id === id ? { ...e, [k]: v } : e));
  }
  function removeEdu(id: string) { setEducations((p) => p.filter((e) => e.id !== id)); }

  /* ── Save ── */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setResumeError(null);
    try {
      const res = await api.put<{
        profileStrength: number; canApply: boolean;
        hasResume: boolean; resumeFileName: string | null;
      }>(
        "/api/profile",
        {
          headline: headline || null,
          phone:    phone ? `+91 ${phone}` : null,
          city:     city || null,
          totalExp: expYearsFor(expLevel),
          about:    about || null,
          skills:   skills.length > 0 ? skills : null,
        }
      );
      setProfileStrength(res.profileStrength);
      setCanApply(res.canApply);

      // If a new resume was selected, upload it after the profile save.
      if (resumeFile) {
        await uploadResume(resumeFile);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // form-level error — user can retry
    } finally {
      setSaving(false);
    }
  }

  async function uploadResume(file: File) {
    setResumeUploading(true);
    setResumeError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.upload<{
        profileStrength: number; canApply: boolean;
        hasResume: boolean; resumeFileName: string | null;
      }>("/api/profile/resume", fd);
      setProfileStrength(res.profileStrength);
      setCanApply(res.canApply);
      setExistingResume(res.resumeFileName);
      setResumeFile(null);
      if (resumeRef.current) resumeRef.current.value = "";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setResumeError(message);
    } finally {
      setResumeUploading(false);
    }
  }

  async function removeResume() {
    setResumeUploading(true);
    setResumeError(null);
    try {
      const res = await api.delete<{
        profileStrength: number; canApply: boolean;
        hasResume: boolean; resumeFileName: string | null;
      }>("/api/profile/resume");
      setProfileStrength(res.profileStrength);
      setCanApply(res.canApply);
      setExistingResume(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed.";
      setResumeError(message);
    } finally {
      setResumeUploading(false);
    }
  }

  if (!user) return null;

  const sections = [
    { id: "basic",      label: "Basic Info",      icon: <User className="w-4 h-4" /> },
    { id: "professional", label: "Professional",  icon: <Briefcase className="w-4 h-4" /> },
    { id: "skills",     label: "Skills",           icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "experience", label: "Experience",       icon: <Briefcase className="w-4 h-4" /> },
    { id: "education",  label: "Education",        icon: <GraduationCap className="w-4 h-4" /> },
    { id: "resume",     label: "Resume",           icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-ivory min-h-screen">

      {/* ── Page header ── */}
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.26em] text-brass mb-1">
                Candidate Profile
              </p>
              <h1 className="font-serif text-2xl font-bold text-surface">
                {user.fullName}
              </h1>
              <p className="text-[13px] font-sans text-[#7A95B0] mt-1">{user.email}</p>
            </div>
            <Link href="/jobs"
              className="hidden sm:inline-flex items-center text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#7A95B0] hover:text-brass border border-navy-border hover:border-brass px-5 py-2.5 transition-all duration-200">
              Browse Jobs →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left sidebar: photo + nav ── */}
          <div className="lg:col-span-3">

            {/* Photo upload */}
            <div className="bg-surface border border-border p-6 mb-4 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-24 h-24 rounded-full bg-navy flex items-center justify-center overflow-hidden border-2 border-border">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-serif text-3xl font-bold text-surface">
                      {user.fullName[0]}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-brass rounded-full flex items-center justify-center hover:bg-brass-light transition-colors">
                  <Camera className="w-3.5 h-3.5 text-navy" />
                </button>
              </div>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                className="text-[11px] font-sans text-muted hover:text-navy transition-colors">
                Upload Photo
              </button>
              <p className="text-[10px] font-sans text-muted/60 mt-1">JPG, PNG · Max 2MB</p>
            </div>

            {/* Section nav */}
            <nav className="bg-surface border border-border overflow-hidden">
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors duration-150 ${
                    i < sections.length - 1 ? "border-b border-border" : ""
                  } ${
                    activeSection === s.id
                      ? "bg-navy text-surface"
                      : "text-muted hover:text-charcoal hover:bg-ivory"
                  }`}
                >
                  <span className={activeSection === s.id ? "text-brass" : ""}>{s.icon}</span>
                  <span className="text-[12px] font-sans font-medium">{s.label}</span>
                </button>
              ))}
            </nav>

            {/* Profile completion */}
            <div className="mt-4 bg-surface border border-border p-5">
              <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-muted mb-3">
                Profile Strength
              </p>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-brass rounded-full transition-all duration-500"
                  style={{ width: `${profileStrength}%` }} />
              </div>
              <p className="text-[12px] font-sans font-semibold text-brass mt-1">{profileStrength}%</p>
              {canApply ? (
                <p className="text-[10px] font-sans text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready to apply
                </p>
              ) : (
                <p className="text-[10px] font-sans text-muted mt-1">
                  Add headline, skills & resume to apply.
                </p>
              )}
            </div>
          </div>

          {/* ── Right: form sections ── */}
          <div className="lg:col-span-9">
            <form onSubmit={handleSave}>

              {/* ── BASIC INFO ── */}
              {activeSection === "basic" && (
                <div className="bg-surface border border-border p-8">
                  <SectionHeader icon={<User className="w-4 h-4" />} title="Basic Information"
                    subtitle="Your personal details and a short professional headline" />

                  <div className="space-y-5">
                    <div>
                      <FieldLabel required>Professional Headline</FieldLabel>
                      <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. Senior Project Manager · 8 Years · PMP Certified"
                        className={inputCls} />
                      <p className="mt-1 text-[10px] font-sans text-muted">This appears below your name in search results.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <FieldLabel required>Mobile Number</FieldLabel>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 text-[13px] font-sans text-muted bg-surface border border-border border-r-0 select-none">+91</span>
                          <input type="tel" value={phone} maxLength={10}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="9876543210" className={`${inputCls} border-l-0 flex-1`} />
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Date of Birth</FieldLabel>
                        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                          className={inputCls} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <FieldLabel required>Current City</FieldLabel>
                        <SelectWrapper>
                          <select value={city} onChange={(e) => setCity(e.target.value)} className={selectCls}>
                            <option value="">Select city</option>
                            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </SelectWrapper>
                      </div>
                      <div>
                        <FieldLabel>Gender</FieldLabel>
                        <SelectWrapper>
                          <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectCls}>
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </SelectWrapper>
                      </div>
                    </div>

                    <div>
                      <FieldLabel>About Me</FieldLabel>
                      <textarea rows={4} value={about} onChange={(e) => setAbout(e.target.value)}
                        placeholder="Write a short summary about your experience, strengths, and what you're looking for..."
                        className={`${inputCls} resize-none`} />
                      <p className="mt-1 text-[10px] font-sans text-muted">{about.length}/500 characters</p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <SaveButton saved={saved} saving={saving} />
                  </div>
                </div>
              )}

              {/* ── PROFESSIONAL ── */}
              {activeSection === "professional" && (
                <div className="bg-surface border border-border p-8">
                  <SectionHeader icon={<Briefcase className="w-4 h-4" />} title="Professional Details"
                    subtitle="Your current role, salary expectations and job preferences" />

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <FieldLabel required>Current Job Title</FieldLabel>
                        <input type="text" value={currentTitle}
                          onChange={(e) => setCurrentTitle(e.target.value)}
                          placeholder="e.g. Project Manager" className={inputCls} />
                      </div>
                      <div>
                        <FieldLabel>Current Company</FieldLabel>
                        <input type="text" value={currentCompany}
                          onChange={(e) => setCurrentCompany(e.target.value)}
                          placeholder="e.g. Infosys" className={inputCls} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <FieldLabel required>Total Experience</FieldLabel>
                        <SelectWrapper>
                          <select value={expLevel} onChange={(e) => setExpLevel(e.target.value)} className={selectCls}>
                            <option value="">Select level</option>
                            {EXP_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
                          </select>
                        </SelectWrapper>
                      </div>
                      <div>
                        <FieldLabel>Notice Period</FieldLabel>
                        <SelectWrapper>
                          <select value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} className={selectCls}>
                            <option value="">Select notice period</option>
                            {NOTICE.map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </SelectWrapper>
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Expected Salary (LPA)</FieldLabel>
                      <div className="flex items-center gap-3">
                        <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)}
                          placeholder="Min" className={`${inputCls} flex-1`} />
                        <span className="text-muted font-sans text-[13px]">to</span>
                        <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)}
                          placeholder="Max" className={`${inputCls} flex-1`} />
                        <span className="text-[12px] font-sans text-muted whitespace-nowrap">₹ LPA</span>
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Preferred Work Type</FieldLabel>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {EMPLOYMENT_TYPES.map((t) => (
                          <button key={t} type="button"
                            onClick={() => toggle(empTypes, t, setEmpTypes)}
                            className={`px-4 py-2 text-[12px] font-sans border transition-colors duration-150 ${
                              empTypes.includes(t)
                                ? "bg-navy text-surface border-navy"
                                : "bg-surface text-muted border-border hover:border-navy/30"
                            }`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Preferred Locations</FieldLabel>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {LOCATIONS.map((l) => (
                          <button key={l} type="button"
                            onClick={() => toggle(prefLocations, l, setPrefLocations)}
                            className={`px-4 py-2 text-[12px] font-sans border transition-colors duration-150 ${
                              prefLocations.includes(l)
                                ? "bg-navy text-surface border-navy"
                                : "bg-surface text-muted border-border hover:border-navy/30"
                            }`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <SaveButton saved={saved} saving={saving} />
                  </div>
                </div>
              )}

              {/* ── SKILLS ── */}
              {activeSection === "skills" && (
                <div className="bg-surface border border-border p-8">
                  <SectionHeader icon={<CheckCircle2 className="w-4 h-4" />} title="Skills"
                    subtitle="Add skills that best represent your expertise. Aim for at least 5." />

                  <div className="space-y-5">
                    {/* Input */}
                    <div>
                      <FieldLabel>Add Skill</FieldLabel>
                      <div className="flex gap-2">
                        <input type="text" value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); }}}
                          placeholder="e.g. JIRA, Agile, PMP..." className={`${inputCls} flex-1`} />
                        <button type="button" onClick={() => addSkill(skillInput)}
                          className="px-5 py-3 text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid transition-colors">
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Added skills */}
                    {skills.length > 0 && (
                      <div>
                        <FieldLabel>Your Skills ({skills.length})</FieldLabel>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((s) => (
                            <span key={s}
                              className="flex items-center gap-2 px-3 py-1.5 bg-navy text-surface text-[12px] font-sans">
                              {s}
                              <button type="button" onClick={() => removeSkill(s)}
                                className="text-[#8AA0BA] hover:text-brass transition-colors">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    <div>
                      <FieldLabel>Suggested Skills</FieldLabel>
                      <div className="flex flex-wrap gap-2">
                        {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).map((s) => (
                          <button key={s} type="button" onClick={() => addSkill(s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[12px] font-sans text-muted hover:border-navy hover:text-navy transition-colors duration-150">
                            <Plus className="w-3 h-3" />{s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <SaveButton saved={saved} saving={saving} />
                  </div>
                </div>
              )}

              {/* ── EXPERIENCE ── */}
              {activeSection === "experience" && (
                <div className="bg-surface border border-border p-8">
                  <SectionHeader icon={<Briefcase className="w-4 h-4" />} title="Work Experience"
                    subtitle="Add your work history starting from the most recent" />

                  <div className="space-y-6">
                    {experiences.map((exp, i) => (
                      <div key={exp.id} className="border border-border p-6 relative">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-brass">
                            Position {i + 1}
                          </p>
                          <button type="button" onClick={() => removeExp(exp.id)}
                            className="text-muted hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <FieldLabel required>Job Title</FieldLabel>
                              <input type="text" value={exp.title}
                                onChange={(e) => updExp(exp.id, "title", e.target.value)}
                                placeholder="e.g. Project Manager" className={inputCls} />
                            </div>
                            <div>
                              <FieldLabel required>Company</FieldLabel>
                              <input type="text" value={exp.company}
                                onChange={(e) => updExp(exp.id, "company", e.target.value)}
                                placeholder="e.g. Wipro" className={inputCls} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <FieldLabel>Start Month</FieldLabel>
                              <SelectWrapper>
                                <select value={exp.startMonth} onChange={(e) => updExp(exp.id, "startMonth", e.target.value)} className={selectCls}>
                                  <option value="">Month</option>
                                  {MONTHS.map((m) => <option key={m}>{m}</option>)}
                                </select>
                              </SelectWrapper>
                            </div>
                            <div>
                              <FieldLabel>Start Year</FieldLabel>
                              <SelectWrapper>
                                <select value={exp.startYear} onChange={(e) => updExp(exp.id, "startYear", e.target.value)} className={selectCls}>
                                  <option value="">Year</option>
                                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                                </select>
                              </SelectWrapper>
                            </div>
                            {!exp.current && (<>
                              <div>
                                <FieldLabel>End Month</FieldLabel>
                                <SelectWrapper>
                                  <select value={exp.endMonth} onChange={(e) => updExp(exp.id, "endMonth", e.target.value)} className={selectCls}>
                                    <option value="">Month</option>
                                    {MONTHS.map((m) => <option key={m}>{m}</option>)}
                                  </select>
                                </SelectWrapper>
                              </div>
                              <div>
                                <FieldLabel>End Year</FieldLabel>
                                <SelectWrapper>
                                  <select value={exp.endYear} onChange={(e) => updExp(exp.id, "endYear", e.target.value)} className={selectCls}>
                                    <option value="">Year</option>
                                    {YEARS.map((y) => <option key={y}>{y}</option>)}
                                  </select>
                                </SelectWrapper>
                              </div>
                            </>)}
                          </div>

                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input type="checkbox" checked={exp.current}
                              onChange={(e) => updExp(exp.id, "current", e.target.checked)}
                              className="w-4 h-4 border-border" />
                            <span className="text-[12px] font-sans text-muted">I currently work here</span>
                          </label>

                          <div>
                            <FieldLabel>Description</FieldLabel>
                            <textarea rows={3} value={exp.description}
                              onChange={(e) => updExp(exp.id, "description", e.target.value)}
                              placeholder="Describe your responsibilities and key achievements..."
                              className={`${inputCls} resize-none`} />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button type="button" onClick={addExp}
                      className="w-full py-3.5 border border-dashed border-border text-[12px] font-sans text-muted hover:border-navy hover:text-navy transition-colors flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Add Work Experience
                    </button>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <SaveButton saved={saved} saving={saving} />
                  </div>
                </div>
              )}

              {/* ── EDUCATION ── */}
              {activeSection === "education" && (
                <div className="bg-surface border border-border p-8">
                  <SectionHeader icon={<GraduationCap className="w-4 h-4" />} title="Education"
                    subtitle="Add your educational qualifications" />

                  <div className="space-y-6">
                    {educations.map((edu, i) => (
                      <div key={edu.id} className="border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-brass">
                            Qualification {i + 1}
                          </p>
                          <button type="button" onClick={() => removeEdu(edu.id)}
                            className="text-muted hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <FieldLabel required>Institution</FieldLabel>
                            <input type="text" value={edu.institution}
                              onChange={(e) => updEdu(edu.id, "institution", e.target.value)}
                              placeholder="e.g. IIT Bombay, Anna University" className={inputCls} />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <FieldLabel required>Degree</FieldLabel>
                              <input type="text" value={edu.degree}
                                onChange={(e) => updEdu(edu.id, "degree", e.target.value)}
                                placeholder="e.g. B.Tech, MBA, MCA" className={inputCls} />
                            </div>
                            <div>
                              <FieldLabel>Field of Study</FieldLabel>
                              <input type="text" value={edu.field}
                                onChange={(e) => updEdu(edu.id, "field", e.target.value)}
                                placeholder="e.g. Computer Science" className={inputCls} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <FieldLabel>Start Year</FieldLabel>
                              <SelectWrapper>
                                <select value={edu.startYear} onChange={(e) => updEdu(edu.id, "startYear", e.target.value)} className={selectCls}>
                                  <option value="">Year</option>
                                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                                </select>
                              </SelectWrapper>
                            </div>
                            <div>
                              <FieldLabel>End Year</FieldLabel>
                              <SelectWrapper>
                                <select value={edu.endYear} onChange={(e) => updEdu(edu.id, "endYear", e.target.value)} className={selectCls}>
                                  <option value="">Year</option>
                                  {YEARS.map((y) => <option key={y}>{y}</option>)}
                                </select>
                              </SelectWrapper>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button type="button" onClick={addEdu}
                      className="w-full py-3.5 border border-dashed border-border text-[12px] font-sans text-muted hover:border-navy hover:text-navy transition-colors flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Add Education
                    </button>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <SaveButton saved={saved} saving={saving} />
                  </div>
                </div>
              )}

              {/* ── RESUME ── */}
              {activeSection === "resume" && (
                <div className="bg-surface border border-border p-8">
                  <SectionHeader icon={<FileText className="w-4 h-4" />} title="Resume / CV"
                    subtitle="Upload your latest resume. PDF format preferred." />

                  <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                    onChange={(e) => { setResumeFile(e.target.files?.[0] ?? null); setResumeError(null); }} />

                  {existingResume && !resumeFile ? (
                    <div className="border border-border p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-navy flex items-center justify-center">
                          <FileText className="w-5 h-5 text-brass" />
                        </div>
                        <div>
                          <p className="text-[13px] font-sans font-medium text-charcoal">Resume on file</p>
                          <p className="text-[11px] font-sans text-muted mt-0.5 break-all">{existingResume}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => resumeRef.current?.click()}
                          disabled={resumeUploading}
                          className="text-[11px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass transition-colors disabled:opacity-60">
                          Replace
                        </button>
                        <button type="button" onClick={removeResume}
                          disabled={resumeUploading}
                          className="text-muted hover:text-red-500 transition-colors disabled:opacity-60"
                          aria-label="Delete resume">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : resumeFile ? (
                    <div className="border border-border p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-navy flex items-center justify-center">
                          <FileText className="w-5 h-5 text-brass" />
                        </div>
                        <div>
                          <p className="text-[13px] font-sans font-medium text-charcoal">{resumeFile.name}</p>
                          <p className="text-[11px] font-sans text-muted mt-0.5">
                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB · pending save
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setResumeFile(null)}
                        className="text-muted hover:text-red-500 transition-colors"
                        aria-label="Cancel">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => resumeRef.current?.click()}
                      disabled={resumeUploading}
                      className="w-full border-2 border-dashed border-border hover:border-navy transition-colors py-14 flex flex-col items-center gap-3 group disabled:opacity-60">
                      <div className="w-12 h-12 bg-ivory group-hover:bg-navy border border-border group-hover:border-navy flex items-center justify-center transition-colors">
                        <Upload className="w-5 h-5 text-muted group-hover:text-brass transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-[13px] font-sans font-medium text-charcoal group-hover:text-navy transition-colors">
                          Click to upload your resume
                        </p>
                        <p className="text-[11px] font-sans text-muted mt-1">PDF, DOC, DOCX · Max 5MB</p>
                      </div>
                    </button>
                  )}

                  {resumeError && (
                    <p className="mt-4 text-[12px] font-sans text-red-600 bg-red-50 border border-red-200 px-3 py-2">
                      {resumeError}
                    </p>
                  )}
                  {resumeUploading && !resumeError && (
                    <p className="mt-4 text-[12px] font-sans text-muted">Uploading…</p>
                  )}

                  <div className="mt-8 flex justify-end">
                    <SaveButton saved={saved} saving={saving} />
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveButton({ saved, saving }: { saved: boolean; saving: boolean }) {
  return (
    <button type="submit" disabled={saving}
      className={`flex items-center gap-2 px-8 py-3 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] transition-all duration-200 disabled:opacity-60 ${
        saved ? "bg-green-600 text-white" : "bg-navy hover:bg-navy-mid text-surface"
      }`}>
      {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : saving ? "Saving…" : "Save Changes →"}
    </button>
  );
}
