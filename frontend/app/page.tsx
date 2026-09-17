import { cookies } from "next/headers";
import { ROLE_COOKIE } from "@/lib/auth";
import HomeGate from "@/components/home/HomeGate";

import PublicHeader          from "@/components/public/PublicHeader";
import HeroSection           from "@/components/public/HeroSection";
import JobSearchBar          from "@/components/public/JobSearchBar";
import PopularRoles          from "@/components/public/PopularRoles";
import StatsStrip            from "@/components/public/StatsStrip";
import EmployerTrust         from "@/components/public/EmployerTrust";
import WhyTalentGrid         from "@/components/public/WhyTalentGrid";
import FeaturedOpportunities from "@/components/public/FeaturedOpportunities";
import SpecialistDisciplines from "@/components/public/SpecialistDisciplines";
import EmployerCTA           from "@/components/public/EmployerCTA";
import CareerInsights        from "@/components/public/CareerInsights";
import FinalCTA              from "@/components/public/FinalCTA";
import PublicFooter          from "@/components/public/PublicFooter";

import { fetchJobs } from "@/lib/jobs";
import { fetchInsights } from "@/lib/insights";
import { fetchJobStatsServer, fetchJobFacetsServer, type JobFacets } from "@/lib/stats";
import { featuredCompanies } from "@/data/companies";
import type { Company } from "@/types";

/**
 * `/` serves two audiences. HomeGate renders the existing candidate workspace for a
 * signed-in candidate and this public landing for everyone else.
 */
export default async function HomePage() {
  const role = (await cookies()).get(ROLE_COOKIE)?.value ?? null;
  return (
    <HomeGate serverRole={role}>
      {role === "CANDIDATE" ? null : <PublicLanding />}
    </HomeGate>
  );
}

/** Organisations with live openings; the fictional demo list only if the API is down. */
function liveCompanies(f: JobFacets | null): { companies: Company[]; isDemo: boolean } {
  if (!f || f.companies.length === 0) return { companies: featuredCompanies, isDemo: true };
  return {
    isDemo: false,
    companies: f.companies.slice(0, 7).map((x, i) => ({
      id: String(i),
      name: x.value,
      initials: x.value.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase(),
    })),
  };
}

async function PublicLanding() {
  const [jobs, stats, facets, insights] = await Promise.all([
    fetchJobs({ size: 3 }),
    fetchJobStatsServer(),
    fetchJobFacetsServer(),
    fetchInsights(),
  ]);
  const { companies, isDemo } = liveCompanies(facets);

  return (
    <>
      <PublicHeader />

      <HeroSection />

      {/* Search sits directly under the hero on the same ivory ground and the same
          container edges, so the first viewport reads as one deliberate block. */}
      <section className="bg-ivory">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-9 lg:pb-10">
          <JobSearchBar />
          <div className="mt-6">
            <PopularRoles />
          </div>
        </div>
      </section>

      <StatsStrip stats={stats} />
      <EmployerTrust companies={companies} isDemo={isDemo} />

      <WhyTalentGrid />
      <FeaturedOpportunities jobs={jobs} />
      <SpecialistDisciplines />
      <EmployerCTA stats={stats} />
      <CareerInsights insights={insights} />
      <FinalCTA />

      <PublicFooter />
    </>
  );
}
