import Link from "next/link";
import type { Company } from "@/types";

interface Props {
  companies: Company[];
  /** true when the names are the fictional fallback rather than live listings. */
  isDemo: boolean;
}

/**
 * Full-width strip of organisations with live openings, below the statistics.
 * When the API is unreachable the fallback names are fictional and labelled as a
 * sample, so this never implies a partnership that does not exist.
 */
export default function EmployerTrust({ companies, isDemo }: Props) {
  if (companies.length === 0) return null;

  return (
    <section className="bg-surface-alt border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <p className="text-[13px] font-sans text-muted mb-6">
          {isDemo
            ? "Trusted by leading organisations (sample data)"
            : "Organisations currently hiring on TalentGrid"}
        </p>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
          {companies.slice(0, 7).map((co) => (
            <Link key={co.id} href={`/jobs?q=${encodeURIComponent(co.name)}`}
              className="group flex items-center gap-3" aria-label={`Roles at ${co.name}`}>
              <span className="w-9 h-9 border border-border flex items-center justify-center text-[10.5px] font-sans font-bold tracking-wider text-muted group-hover:border-brass group-hover:text-brass transition-colors duration-150">
                {co.initials}
              </span>
              <span className="font-sans text-[15px] font-medium text-navy/70 group-hover:text-navy transition-colors duration-150 whitespace-nowrap">
                {co.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
