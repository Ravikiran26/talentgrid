import Link from "next/link";
import type { Insight } from "@/lib/insights";

export default function CareerInsights({ articles }: { articles: Insight[] }) {
  const [featured, ...rest] = articles;
  if (!featured) return null;

  return (
    <section id="insights" aria-labelledby="insights-heading" className="scroll-mt-24">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.24em] text-brass">TalentGrid insights</p>
          <h2 id="insights-heading" className="mt-1 font-sans text-[20px] font-semibold text-navy tracking-tight">For serious PM careers</h2>
        </div>
        <Link href="/insights" className="text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass transition-colors">
          All insights →
        </Link>
      </div>

      <div className="bg-white border border-border rounded-[8px] grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-border">
        <article className="p-7">
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-muted">{featured.category} · {featured.readTime}</p>
          <h3 className="mt-3 font-serif text-[1.71rem] font-semibold text-navy leading-snug">
            <Link href={`/insights/${featured.slug}`} className="hover:text-brass transition-colors">{featured.title}</Link>
          </h3>
          <p className="mt-3 text-[15.5px] font-sans text-muted leading-relaxed max-w-xl">{featured.excerpt}</p>
          <Link href={`/insights/${featured.slug}`} className="mt-5 inline-block text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass transition-colors">
            Read insight →
          </Link>
        </article>
        <div className="divide-y divide-border">
          {rest.slice(0, 3).map((a) => (
            <article key={a.id} className="p-6">
              <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-muted">{a.category} · {a.readTime}</p>
              <h3 className="mt-2 font-serif text-[1.21rem] font-semibold text-navy leading-snug">
                <Link href={`/insights/${a.slug}`} className="hover:text-brass transition-colors">{a.title}</Link>
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
