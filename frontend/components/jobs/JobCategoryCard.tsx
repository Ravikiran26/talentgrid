import Link from "next/link";
import type { JobCategory } from "@/types";

interface Props {
  category: JobCategory;
  index: number;
}

export default function JobCategoryCard({ category, index }: Props) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <div className="group py-9 border-b border-navy-border last:border-b-0">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Number */}
        <div className="md:col-span-1">
          <span className="font-serif text-4xl font-bold text-brass leading-none select-none">
            {num}
          </span>
        </div>

        {/* Text */}
        <div className="md:col-span-7">
          <h3 className="font-serif text-3xl font-semibold text-surface tracking-tight group-hover:text-brass transition-colors duration-200">
            {category.name.toUpperCase()}
          </h3>
          <p className="mt-2.5 text-[15px] font-sans text-navy-text leading-relaxed max-w-lg">
            {category.description}
          </p>
        </div>

        {/* Count + CTA */}
        <div className="md:col-span-4 flex md:flex-col md:items-end items-center gap-4 md:gap-3">
          <span className="text-[13px] font-sans font-semibold uppercase tracking-[0.18em] text-brass">
            {category.jobCount} Opportunities
          </span>
          <Link
            href={`/jobs?category=${category.slug}`}
            className="text-[13px] font-sans font-medium uppercase tracking-[0.16em] text-navy-text border border-navy-border hover:border-brass hover:text-brass px-5 py-2 transition-all duration-200"
            aria-label={`Explore ${category.name} roles`}
          >
            Explore →
          </Link>
        </div>
      </div>
    </div>
  );
}
