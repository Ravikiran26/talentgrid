import Link from "next/link";
import { fetchInsights, formatPublished } from "@/lib/insights";

export const metadata = { title: "Career Insights · TalentGrid" };

export default async function InsightsPage() {
  const articles = await fetchInsights();
  const [featured, ...rest] = articles;

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10">
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-1">TalentGrid Insights</p>
          <h1 className="font-serif text-4xl font-bold text-surface">Career Insights</h1>
          <p className="text-[15px] font-sans text-navy-text mt-1">Hiring trends, salary data and practical advice for project management careers in India.</p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10">
        {articles.length === 0 ? (
          <p className="text-[15px] font-sans text-muted bg-surface border border-border p-8 text-center">No insights published yet.</p>
        ) : (
          <>
            <article className="bg-surface border border-border p-8 lg:p-10 mb-6">
              <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-brass">{featured.category} · {featured.readTime} · {formatPublished(featured.publishedAt)}</p>
              <h2 className="mt-3 font-serif text-[2.2rem] font-semibold text-navy leading-tight">
                <Link href={`/insights/${featured.slug}`} className="hover:text-brass transition-colors">{featured.title}</Link>
              </h2>
              <p className="mt-4 text-[16px] font-sans text-muted leading-relaxed max-w-2xl">{featured.excerpt}</p>
              <Link href={`/insights/${featured.slug}`} className="mt-6 inline-block text-[13px] font-sans font-semibold uppercase tracking-[0.18em] text-navy border border-navy px-6 py-2.5 hover:bg-navy hover:text-surface transition-colors">
                Read insight →
              </Link>
            </article>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {rest.map((a) => (
                <article key={a.id} className="bg-surface border border-border p-7 hover:border-navy/30 transition-colors">
                  <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-muted">{a.category} · {a.readTime} · {formatPublished(a.publishedAt)}</p>
                  <h3 className="mt-2 font-serif text-[1.43rem] font-semibold text-navy leading-snug">
                    <Link href={`/insights/${a.slug}`} className="hover:text-brass transition-colors">{a.title}</Link>
                  </h3>
                  <p className="mt-2 text-[15px] font-sans text-muted leading-relaxed">{a.excerpt}</p>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
