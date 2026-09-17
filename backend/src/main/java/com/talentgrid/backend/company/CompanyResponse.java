package com.talentgrid.backend.company;

import com.talentgrid.backend.job.dto.JobResponse;

import java.time.Instant;
import java.util.List;

public record CompanyResponse(
        Long id, String name, String logoInitials, String website, String industry,
        String size, String city, String description, Instant createdAt,
        long openJobs, List<JobResponse> jobs
) {
    public static CompanyResponse fromEntity(Company c, List<JobResponse> jobs) {
        return new CompanyResponse(c.getId(), c.getName(), c.getLogoInitials(), c.getWebsite(), c.getIndustry(),
                c.getSize(), c.getCity(), c.getDescription(), c.getCreatedAt(), jobs.size(), jobs);
    }
}
