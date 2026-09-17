import Link from "next/link";
import { formatPublished, type Insight } from "@/lib/insights";

interface Props { insights: Insight[] }

export default function CareerInsights({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <section className="bg-ivory border-t border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-20">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-11 h-[2px] bg-brass" />
              <span className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.24em] text-muted">
                Career Insights
              </span>
            </div>
            <h2 className="font-serif text-[2.1rem] font-bold text-navy leading-tight tracking-tight">
              TalentGrid Insights
            </h2>
          </div>
          <Link href="/insights"
            className="self-start text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-navy border-b-2 border-brass pb-1.5 hover:text-brass transition-colors whitespace-nowrap">
            All insights →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {insights.slice(0, 3).map((a, i) => (
            <article key={a.id} className="group bg-surface border border-border flex flex-col">
              {/* Editorial plate: a numbered navy field rather than stock photography */}
              <div className="relative h-[150px] bg-navy overflow-hidden">
                <div className="absolute inset-0 opacity-[0.07]" style={{
                  backgroundImage: [
                    "repeating-linear-gradient(0deg,  var(--color-brass) 0, var(--color-brass) 1px, transparent 1px, transparent 46px)",
                    "repeating-linear-gradient(90deg, var(--color-brass) 0, var(--color-brass) 1px, transparent 1px, transparent 46px)",
                  ].join(","),
                }} />
                <span aria-hidden
                  className="absolute top-6 right-7 font-serif text-[3.4rem] font-bold text-surface/[0.12] leading-none select-none tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="absolute bottom-5 left-6">
                  <div className="w-8 h-[2px] bg-brass mb-3" />
                  <p className="text-[10.5px] font-sans font-semibold uppercase tracking-[0.22em] text-navy-text-light">
                    {a.category}
                  </p>
                </div>
              </div>

              <div className="p-7 flex flex-col flex-1">
                <p className="text-[12.5px] font-sans text-muted">{a.readTime} · {formatPublished(a.publishedAt)}</p>
                <h3 className="mt-3 font-serif text-[1.25rem] font-bold text-navy leading-snug">
                  <Link href={`/insights/${a.slug}`} className="hover:text-brass transition-colors">
                    {a.title}
                  </Link>
                </h3>
                <p className="mt-3 text-[14.5px] font-sans text-muted leading-relaxed line-clamp-3">{a.excerpt}</p>
                <Link href={`/insights/${a.slug}`}
                  className="mt-auto pt-6 text-[11.5px] font-sans font-semibold uppercase tracking-[0.16em] text-navy group-hover:text-brass transition-colors">
                  Read insight →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
