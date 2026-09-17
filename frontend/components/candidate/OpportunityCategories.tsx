import Link from "next/link";
import { jobCategories } from "@/data/categories";

export interface OpportunityGroup {
  label: string;
  count: number;
}

/** DB categories are slugs (e.g. "manager"); show the friendly name when we know it. */
export function categoryLabel(slug: string): string {
  const known = jobCategories.find((c) => c.slug === slug);
  if (known) return known.name;
  return slug.split(/[-_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function OpportunityCategories({ groups }: { groups: OpportunityGroup[] }) {
  return (
    <section aria-labelledby="new-opps-heading">
      <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.24em] text-brass">New opportunities</p>
      <h2 id="new-opps-heading" className="mt-1 mb-4 font-sans text-[20px] font-semibold text-navy tracking-tight">New this week</h2>
      {groups.length === 0 ? (
        <p className="text-[15px] font-sans text-muted bg-white border border-border rounded-[8px] p-5">
          No new roles were posted in the last 7 days. <Link href="/jobs" className="text-navy hover:text-brass underline underline-offset-2">Browse all roles</Link>.
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((g) => (
            <Link key={g.label} href={`/jobs?category=${encodeURIComponent(g.label)}`}
              className="group bg-white border border-border rounded-[8px] p-5 transition-all duration-200 hover:border-navy/25 hover:shadow-[0_6px_20px_rgba(7,24,39,0.06)]">
              <p className="font-serif text-[2.42rem] font-semibold text-navy leading-none">{g.count}</p>
              <p className="mt-2 text-[15px] font-sans text-charcoal">{categoryLabel(g.label)}</p>
              <p className="mt-3 text-[13px] font-sans font-semibold uppercase tracking-[0.14em] text-muted group-hover:text-brass transition-colors">View roles →</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
