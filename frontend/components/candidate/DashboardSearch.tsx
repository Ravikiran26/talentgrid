"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";

const QUICK_FILTERS = [
  { label: "Project Manager", q: "Project Manager" },
  { label: "PMO",             q: "PMO" },
  { label: "Scrum Master",    q: "Scrum Master" },
  { label: "Program Manager", q: "Program Manager" },
  { label: "Agile Delivery",  q: "Agile Delivery" },
  { label: "RTE",             q: "Release Train Engineer" },
];

const EXPERIENCE = [
  { value: "",     label: "Experience" },
  { value: "3-6",  label: "3–6 years" },
  { value: "6-10", label: "6–10 years" },
  { value: "10+",  label: "10+ years" },
];

export default function DashboardSearch() {
  const router = useRouter();
  const [q, setQ]     = useState("");
  const [loc, setLoc] = useState("");
  const [exp, setExp] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q)   p.set("q", q);
    if (loc) p.set("location", loc);
    if (exp) p.set("experience", exp);
    router.push(`/jobs?${p.toString()}`);
  }

  const cell = "flex items-center gap-2.5 px-4 h-[54px] border-border";
  const input = "w-full bg-transparent text-[15.5px] font-sans text-charcoal placeholder:text-muted-light focus:outline-none";

  return (
    <section aria-label="Search opportunities">
      <form onSubmit={submit} role="search"
        className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px_190px_auto] bg-white border border-border rounded-[6px] overflow-hidden shadow-[0_1px_2px_rgba(7,24,39,0.04)] focus-within:border-navy/40 transition-colors">
        <label className={`${cell} border-b md:border-b-0 md:border-r`}>
          <Search className="w-4 h-4 text-muted flex-shrink-0" />
          <span className="sr-only">Role, skill or company</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search role, skill or company" className={input} />
        </label>
        <label className={`${cell} border-b md:border-b-0 md:border-r`}>
          <MapPin className="w-4 h-4 text-muted flex-shrink-0" />
          <span className="sr-only">Location</span>
          <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Location" className={input} />
        </label>
        <label className={`${cell} border-b md:border-b-0 md:border-r relative`}>
          <span className="sr-only">Experience</span>
          <select value={exp} onChange={(e) => setExp(e.target.value)}
            className={`${input} appearance-none cursor-pointer pr-6 ${exp ? "text-charcoal" : "text-muted-light"}`}>
            {EXPERIENCE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 text-muted absolute right-4 pointer-events-none" />
        </label>
        <button type="submit"
          className="h-[54px] px-8 bg-navy hover:bg-navy-mid text-white text-[13px] font-sans font-semibold uppercase tracking-[0.2em] transition-colors">
          Search
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-2">
        <span className="text-[13px] font-sans text-muted mr-2">Quick filters</span>
        {QUICK_FILTERS.map((f) => (
          <Link key={f.label} href={`/jobs?q=${encodeURIComponent(f.q)}`}
            className="text-[14px] font-sans text-charcoal/80 hover:text-navy border border-border hover:border-navy/40 bg-white/60 hover:bg-white rounded-[4px] px-3 py-1.5 transition-colors">
            {f.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
