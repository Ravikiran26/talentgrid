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
        <p className="font-serif text-[2.2rem] font-semibold text-navy leading-none">{strength}%</p>
      </div>
      <div className="mt-3 h-[6px] w-full bg-track rounded-full overflow-hidden">
        <div className="h-full bg-navy rounded-full transition-[width] duration-500" style={{ width: `${Math.max(strength, 3)}%` }} />
      </div>

      {missing.length > 0 ? (
        <div className="mt-4">
          <p className="text-[13px] font-sans text-muted">
            {missing.length} missing {missing.length === 1 ? "item" : "items"}
          </p>
          <ul className="mt-1.5 space-y-1">
            {shown.map((m) => (
              <li key={m} className="flex items-center gap-2 text-[14.5px] font-sans text-charcoal">
                <span className="w-1 h-1 rounded-full bg-brass" /> {m}
              </li>
            ))}
            {extra > 0 && <li className="text-[13.5px] font-sans text-muted pl-3">+{extra} more</li>}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-[14.5px] font-sans text-charcoal">Your profile is complete and visible to employers.</p>
      )}

      <Link href="/profile"
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass transition-colors">
        Complete profile <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
