"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface JobSearchProps {
  defaultKeyword?:    string;
  defaultLocation?:   string;
  defaultExperience?: string;
  /** true → compact inline bar for /jobs page header */
  compact?: boolean;
}

export default function JobSearch({
  defaultKeyword    = "",
  defaultLocation   = "",
  defaultExperience = "",
  compact = false,
}: JobSearchProps) {
  const router = useRouter();
  const [kw,  setKw]  = useState(defaultKeyword);
  const [loc, setLoc] = useState(defaultLocation);
  const [exp, setExp] = useState(defaultExperience);

  function go(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (kw)  p.set("q", kw);
    if (loc) p.set("location", loc);
    if (exp) p.set("experience", exp);
    router.push(`/jobs?${p.toString()}`);
  }

  const labelCls = "block text-[9px] font-sans font-semibold uppercase tracking-[0.22em] text-brass mb-2";
  const inputCls = "w-full bg-transparent text-[13px] font-sans text-ivory placeholder-[#4A6A8A] focus:outline-none";

  /* ── compact bar (used on /jobs page, ivory bg) ── */
  if (compact) {
    return (
      <form onSubmit={go} role="search" aria-label="Search jobs">
        <div className="flex flex-col sm:flex-row border border-border bg-surface">
          <div className="flex-1 px-4 py-3 border-b sm:border-b-0 sm:border-r border-border">
            <label htmlFor="c-kw" className="sr-only">Role or skill</label>
            <input id="c-kw" type="text" value={kw} onChange={(e) => setKw(e.target.value)}
              placeholder="Role, skill or company"
              className="w-full text-[13px] font-sans text-charcoal placeholder-muted bg-transparent focus:outline-none" />
          </div>
          <div className="sm:w-44 px-4 py-3 border-b sm:border-b-0 sm:border-r border-border">
            <label htmlFor="c-loc" className="sr-only">Location</label>
            <input id="c-loc" type="text" value={loc} onChange={(e) => setLoc(e.target.value)}
              placeholder="Location"
              className="w-full text-[13px] font-sans text-charcoal placeholder-muted bg-transparent focus:outline-none" />
          </div>
          <div className="sm:w-44 px-4 py-3 border-b sm:border-b-0 sm:border-r border-border">
            <label htmlFor="c-exp" className="sr-only">Experience</label>
            <select id="c-exp" value={exp} onChange={(e) => setExp(e.target.value)}
              className="w-full text-[13px] font-sans text-muted bg-transparent appearance-none cursor-pointer focus:outline-none">
              <option value="">Experience</option>
              <option value="0-1">0–1 Years</option>
              <option value="1-3">1–3 Years</option>
              <option value="3-6">3–6 Years</option>
              <option value="6-10">6–10 Years</option>
              <option value="10+">10+ Years</option>
            </select>
          </div>
          <button type="submit"
            className="px-7 py-3 text-[11px] font-sans font-medium uppercase tracking-[0.2em] text-surface bg-navy hover:bg-navy-mid transition-colors whitespace-nowrap">
            Search
          </button>
        </div>
      </form>
    );
  }

  /* ── Full hero search strip (dark navy bg) ── */
  return (
    <form onSubmit={go} role="search" aria-label="Search opportunities">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px_160px_auto]">
        {/* Role */}
        <div className="px-5 py-5 border border-navy-border sm:border-r-0 border-b sm:border-b-0">
          <label htmlFor="h-kw" className={labelCls}>Role / Skill</label>
          <input id="h-kw" type="text" value={kw} onChange={(e) => setKw(e.target.value)}
            placeholder="e.g. Java Developer"
            className={inputCls} />
        </div>
        {/* Location */}
        <div className="px-5 py-5 border border-navy-border border-b sm:border-b-0 sm:border-l-0">
          <label htmlFor="h-loc" className={labelCls}>Location</label>
          <input id="h-loc" type="text" value={loc} onChange={(e) => setLoc(e.target.value)}
            placeholder="e.g. Bengaluru"
            className={inputCls} />
        </div>
        {/* Experience */}
        <div className="px-5 py-5 border border-navy-border border-b sm:border-b-0 sm:border-l-0">
          <label htmlFor="h-exp" className={labelCls}>Experience</label>
          <select id="h-exp" value={exp} onChange={(e) => setExp(e.target.value)}
            className={`${inputCls} cursor-pointer appearance-none`}>
            <option value="">Any level</option>
            <option value="0-1">0–1 Years</option>
            <option value="1-3">1–3 Years</option>
            <option value="3-6">3–6 Years</option>
            <option value="6-10">6–10 Years</option>
            <option value="10+">10+ Years</option>
          </select>
        </div>
        {/* Submit */}
        <button type="submit"
          className="px-8 py-5 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-navy bg-ivory hover:bg-surface transition-colors border border-l-0 border-navy-border focus:outline-none whitespace-nowrap">
          Search →
        </button>
      </div>
    </form>
  );
}
