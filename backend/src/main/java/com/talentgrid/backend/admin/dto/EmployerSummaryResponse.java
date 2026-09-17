package com.talentgrid.backend.admin.dto;

import com.talentgrid.backend.company.Company;
import com.talentgrid.backend.user.CandidateStatus;
import com.talentgrid.backend.user.User;

import java.time.Instant;

public record EmployerSummaryResponse(
        Long id, String fullName, String email, String phone, CandidateStatus status, Instant createdAt,
        CompanyInfo company, long openJobs, long totalJobs
) {
    public record CompanyInfo(Long id, String name, String website, String industry, String city, String size) {}

    public static EmployerSummaryResponse from(User u, Company c, long openJobs, long totalJobs) {
        return new EmployerSummaryResponse(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getStatus(),
                u.getCreatedAt(),
                c == null ? null : new CompanyInfo(c.getId(), c.getName(), c.getWebsite(), c.getIndustry(), c.getCity(), c.getSize()),
                openJobs, totalJobs);
    }
}
