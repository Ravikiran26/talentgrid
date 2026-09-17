import Link from "next/link";

const ROLES = [
  "Project Manager", "PMO", "Scrum Master",
  "Program Manager", "Agile Delivery", "Release Train Engineer",
];

export default function PopularRoles() {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2.5">
      <span className="text-[14px] font-sans text-muted mr-1.5">Popular roles:</span>
      {ROLES.map((r) => (
        <Link key={r} href={`/jobs?q=${encodeURIComponent(r)}`}
          className="text-[13.5px] font-sans text-charcoal bg-surface border border-border px-4 py-2 hover:border-brass hover:text-navy transition-colors duration-150">
          {r}
        </Link>
      ))}
    </div>
  );
}
