import type { Metadata } from "next";
import JobsList from "@/components/jobs/JobsList";

export const metadata: Metadata = {
  title: "Opportunities",
  description: "Browse verified job opportunities across Technology, Management, and Operations.",
};

export default async function JobsPage({ searchParams }: PageProps<"/jobs">) {
  const params   = await searchParams;
  const category = typeof params?.category === "string" ? params.category : "";
  const keyword  = typeof params?.q        === "string" ? params.q        : "";
  const location = typeof params?.location === "string" ? params.location : "";
  const sort     = typeof params?.sort     === "string" ? params.sort     : "";

  return (
    <div className="bg-ivory min-h-screen">
      {/* Page header */}
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-10">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-brass mb-2">
            Open Roles
          </p>
          <h1 className="font-serif text-3xl font-bold text-surface">
            Opportunities
          </h1>
          <p className="mt-2 text-[13px] text-[#8A9DB5]">
            Verified project management positions — Coordinator, Manager, and Lead roles.
          </p>
        </div>
      </div>

      {/* Listing area */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-10">
        <JobsList
          initialCategory={category}
          initialKeyword={keyword}
          initialLocation={location}
          initialSort={sort}
        />
      </div>
    </div>
  );
}
