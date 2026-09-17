import Link from "next/link";
import type { ApplicationRow } from "./types";
import ApplicationStatusBadge from "./ApplicationStatusBadge";

function shortDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function RecentApplications({ applications }: { applications: ApplicationRow[] }) {
  const rows = applications.slice(0, 4);

  return (
    <section aria-labelledby="applications-heading">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[0.24em] text-brass">Application activity</p>
          <h2 id="applications-heading" className="mt-1 font-sans text-[20px] font-semibold text-navy tracking-tight">Recent applications</h2>
        </div>
        <Link href="/applications" className="text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass transition-colors whitespace-nowrap">
          View all applications →
        </Link>
      </div>

      <div className="bg-white border border-border rounded-[8px] overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[15.5px] font-sans text-muted">You haven&apos;t applied to any roles yet.</p>
            <Link href="/jobs" className="mt-3 inline-block text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-navy hover:text-brass">Find a role →</Link>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-border">
                {["Role", "Company", "Status", "Applied"].map((h) => (
                  <th key={h} scope="col" className="px-5 py-3 text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-4 align-top">
                    <Link href={`/jobs/${a.jobId}`} className="text-[16px] font-sans font-semibold text-navy hover:text-brass transition-colors">{a.jobTitle}</Link>
                    <p className="md:hidden mt-0.5 text-[14px] font-sans text-muted">{a.company} · {shortDate(a.appliedAt)}</p>
                  </td>
                  <td className="hidden md:table-cell px-5 py-4 text-[15px] font-sans text-charcoal align-top">{a.company}</td>
                  <td className="px-5 py-4 align-top"><ApplicationStatusBadge status={a.status} /></td>
                  <td className="hidden md:table-cell px-5 py-4 text-[15px] font-sans text-muted align-top whitespace-nowrap">{shortDate(a.appliedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
