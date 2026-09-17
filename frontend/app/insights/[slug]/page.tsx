import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchInsight, fetchInsights, formatPublished, splitBody } from "@/lib/insights";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await fetchInsight(slug);
  return { title: a ? `${a.title} · TalentGrid Insights` : "Insight not found" };
}

export default async function InsightDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, all] = await Promise.all([fetchInsight(slug), fetchInsights()]);
  if (!article) notFound();

  const blocks = splitBody(article.body ?? "");
  const more = all.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[820px] mx-auto px-6 lg:px-10 py-10">
          <Link href="/insights" className="text-[12px] font-sans font-semibold uppercase tracking-[0.24em] text-brass hover:text-surface transition-colors">← All insights</Link>
          <p className="mt-4 text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-navy-text">
            {article.category} · {article.readTime} · {formatPublished(article.publishedAt)}
          </p>
          <h1 className="mt-3 font-serif text-[2.42rem] font-bold text-surface leading-tight">{article.title}</h1>
        </div>
      </div>

      <div className="max-w-[820px] mx-auto px-6 lg:px-10 py-10">
        <article className="bg-surface border border-border px-8 py-9 lg:px-12 lg:py-11">
          <p className="text-[17px] font-sans text-charcoal leading-relaxed font-medium">{article.excerpt}</p>
          <div className="w-10 h-[2px] bg-brass my-7" />
          {blocks.map((b, i) =>
            b.type === "h2" ? (
              <h2 key={i} className="mt-8 mb-3 font-serif text-[1.54rem] font-semibold text-navy">{b.text}</h2>
            ) : (
              <p key={i} className="mb-4 text-[16.5px] font-sans text-charcoal leading-[1.75]">{b.text}</p>
            ),
          )}
        </article>

        {more.length > 0 && (
          <section className="mt-10">
            <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.24em] text-brass mb-4">More insights</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {more.map((a) => (
                <Link key={a.id} href={`/insights/${a.slug}`} className="bg-surface border border-border p-5 hover:border-navy/30 transition-colors">
                  <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-muted">{a.category}</p>
                  <p className="mt-2 font-serif text-[1.16rem] font-semibold text-navy leading-snug">{a.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
