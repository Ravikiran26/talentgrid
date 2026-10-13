import Link from "next/link";

interface Props {
  strength: number;
  missing: string[];
}

export default function ProfileStrengthCard({ strength, missing }: Props) {
  const shown = missing.slice(0, 2);
  const extra = missing.length - shown.length;

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="flex items-baseline justify-between">
        <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.22em] text-muted">Profile strength</p>
        <p className="font-serif text-[1.9rem] font-semibold text-navy leading-none">{strength}%</p>
      </div>
      <div className="mt-3 h-[6px] w-full bg-track rounded-full overflow-hidden">
        <div className="h-full bg-navy rounded-full transition-[width] duration-500" style={{ width: `${Math.max(strength, 3)}%` }} />
      </div>

      {missing.length > 0 ? (
        <p className="mt-3 text-[13.5px] font-sans text-muted leading-relaxed">
          Missing: <span className="text-charcoal">{shown.join(", ")}</span>
          {extra > 0 && <> +{extra} more</>}
        </p>
      ) : (
        <p className="mt-3 text-[14.5px] font-sans text-charcoal">Your profile is complete and visible to employers.</p>
      )}

      <Link href="/profile"
        className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass transition-colors">
        Complete profile <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
