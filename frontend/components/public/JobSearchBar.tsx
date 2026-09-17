import JobSearch from "@/components/jobs/JobSearch";

/**
 * The landing-page search. Wraps the shared JobSearch so the query it builds
 * stays identical to the one used on /jobs — one source of truth for search.
 */
export default function JobSearchBar() {
  return <JobSearch hero />;
}
