"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { jobCategories } from "@/data/categories";
import { locations } from "@/data/jobs";
import type { FilterState } from "@/types";

interface Props { filters: FilterState; onChange: (f: FilterState) => void; }

const expOpts  = [
  { label: "Any experience", v: "" },
  { label: "0–1 Years",  v: "0-1"  },
  { label: "1–3 Years",  v: "1-3"  },
  { label: "3–6 Years",  v: "3-6"  },
  { label: "6–10 Years", v: "6-10" },
  { label: "10+ Years",  v: "10+"  },
];
const salOpts  = [
  { label: "Any salary",    v: ""   },
  { label: "Up to ₹5 LPA",  v: "5"  },
  { label: "₹5–10 LPA",     v: "10" },
  { label: "₹10–20 LPA",    v: "20" },
  { label: "₹20+ LPA",      v: "21" },
];
const typeOpts = [
  { label: "All types",   v: ""          },
  { label: "Full-time",   v: "Full-time"  },
  { label: "Part-time",   v: "Part-time"  },
  { label: "Contract",    v: "Contract"   },
  { label: "Internship",  v: "Internship" },
];

function Dropdown({ label, value, opts, onChange }: {
  label: string;
  value: string;
  opts: { label: string; v: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = value !== "";
  const selected = opts.find((o) => o.v === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 text-[12px] font-sans border transition-colors duration-150 whitespace-nowrap focus:outline-none ${
          active
            ? "border-navy bg-navy text-surface"
            : "border-border bg-surface text-muted hover:border-charcoal hover:text-charcoal"
        }`}
      >
        <span>{active ? selected?.label : label}</span>
        {active ? (
          <X className="w-3 h-3 flex-shrink-0" onClick={(e) => { e.stopPropagation(); onChange(""); setOpen(false); }} />
        ) : (
          <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-surface border border-border shadow-sm z-30 min-w-[160px]">
          {opts.map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => { onChange(o.v); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[12px] font-sans transition-colors duration-100 ${
                o.v === value
                  ? "bg-navy text-surface"
                  : "text-charcoal hover:bg-ivory"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JobFilters({ filters, onChange }: Props) {
  const upd = useCallback((p: Partial<FilterState>) => onChange({ ...filters, ...p }), [filters, onChange]);

  function handleExp(val: string) {
    if (!val) { upd({ experienceMin: null, experienceMax: null }); return; }
    const [min, max] = val === "10+" ? [10, 99] : val.split("-").map(Number);
    upd({ experienceMin: min, experienceMax: max });
  }
  function getExp(): string {
    if (filters.experienceMin === null) return "";
    return filters.experienceMin === 10 ? "10+" : `${filters.experienceMin}-${filters.experienceMax}`;
  }

  const catOpts = [
    { label: "All categories", v: "" },
    ...jobCategories.map((c) => ({ label: c.name, v: c.slug })),
  ];
  const locOpts = [
    { label: "All locations", v: "" },
    ...locations.map((l) => ({ label: l, v: l })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[9px] font-sans font-semibold uppercase tracking-[0.2em] text-muted mr-1 hidden sm:inline">
        Filter
      </span>
      <Dropdown label="Category"   value={filters.category}      opts={catOpts}  onChange={(v) => upd({ category: v })} />
      <Dropdown label="Experience" value={getExp()}               opts={expOpts}  onChange={handleExp} />
      <Dropdown label="Location"   value={filters.location}       opts={locOpts}  onChange={(v) => upd({ location: v })} />
      <Dropdown label="Salary"
        value={filters.salaryMin !== null ? String(filters.salaryMin) : ""}
        opts={salOpts}
        onChange={(v) => upd({ salaryMin: v ? Number(v) : null })}
      />
      <Dropdown label="Type"       value={filters.employmentType} opts={typeOpts} onChange={(v) => upd({ employmentType: v })} />
    </div>
  );
}
