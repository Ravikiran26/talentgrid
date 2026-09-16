import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 bg-ivory">
      <div className="text-center max-w-md">
        <p className="text-[9px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-6">
          404 · Page Not Found
        </p>

        <h1 className="font-serif text-[5rem] sm:text-[7rem] font-bold text-navy leading-none tracking-tight">
          404
        </h1>

        <div className="w-10 h-[1px] bg-brass mx-auto my-8" />

        <p className="font-serif text-[1.4rem] font-medium text-navy leading-snug mb-4">
          This page doesn&apos;t exist.
        </p>
        <p className="text-[14px] font-sans text-muted leading-relaxed mb-10">
          The role or page you&apos;re looking for may have been removed or the
          link may be incorrect.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/"
            className="inline-flex items-center text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-surface bg-navy hover:bg-navy-mid px-8 py-3.5 transition-colors duration-150">
            Go to Homepage
          </Link>
          <Link href="/jobs"
            className="inline-flex items-center text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-charcoal border border-border hover:border-navy hover:text-navy px-8 py-3.5 transition-colors duration-150">
            Browse Roles →
          </Link>
        </div>
      </div>
    </div>
  );
}
