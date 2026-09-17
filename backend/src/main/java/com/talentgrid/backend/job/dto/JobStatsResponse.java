package com.talentgrid.backend.job.dto;

import java.util.List;

/** Public aggregate numbers for the landing page and candidate dashboard. */
public record JobStatsResponse(
        long activeJobs,
        long companies,
        long cities,
        long categories,
        List<Bucket> newThisWeek
) {
    public record Bucket(String label, long count) {}
}
