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
        {/* Names set as quiet wordmarks between hairline dividers, rather than initial tiles. */}
        <ul className="grid grid-cols-2 gap-y-3 sm:flex sm:flex-wrap sm:items-center sm:gap-y-4">
          {companies.slice(0, 7).map((co) => (
            <li key={co.id}
              className="sm:pr-7 sm:mr-7 sm:border-r border-border sm:last:border-r-0 sm:last:pr-0 sm:last:mr-0">
              <Link href={`/jobs?q=${encodeURIComponent(co.name)}`} aria-label={`Roles at ${co.name}`}
                className="font-serif text-[1.15rem] font-bold text-navy/55 hover:text-navy transition-colors duration-150 whitespace-nowrap">
                {co.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
