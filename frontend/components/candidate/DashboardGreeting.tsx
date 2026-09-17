import ProfileStrengthCard from "./ProfileStrengthCard";

interface Props {
  firstName: string;
  weeklyMatches: number;
  strength: number;
  missing: string[];
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardGreeting({ firstName, weeklyMatches, strength, missing }: Props) {
  return (
    <section className="bg-white border border-border rounded-[8px] grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="px-7 py-7 flex flex-col justify-center">
        <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.24em] text-brass">My career</p>
        <h1 className="mt-2 font-serif text-[2.04rem] lg:text-[2.31rem] font-semibold text-navy leading-[1.1] tracking-tight">
          {greeting()}, {firstName}.
        </h1>
        <p className="mt-2 text-[16px] font-sans text-charcoal">Find your next Project Management opportunity.</p>
        {weeklyMatches > 0 && (
          <p className="mt-3 inline-flex items-center gap-2 text-[14.5px] font-sans text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-brass" />
            {weeklyMatches} new opportunities match your profile this week.
          </p>
        )}
      </div>
      <div className="px-7 py-6 border-t lg:border-t-0 lg:border-l border-border">
        <ProfileStrengthCard strength={strength} missing={missing} />
      </div>
    </section>
  );
}
