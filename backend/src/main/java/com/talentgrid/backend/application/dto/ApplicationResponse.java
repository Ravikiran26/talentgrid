package com.talentgrid.backend.application.dto;

import com.talentgrid.backend.application.Application;
import com.talentgrid.backend.application.ApplicationStatus;

import java.time.Instant;

public record ApplicationResponse(
        Long id,
        Long jobId,
        String jobTitle,
        String company,
        String location,
        ApplicationStatus status,
        String coverLetter,
        String resumeUrl,
        Instant appliedAt
) {
    public static ApplicationResponse fromEntity(Application app) {
        return new ApplicationResponse(
                app.getId(),
                app.getJob().getId(),
                app.getJob().getTitle(),
                app.getJob().getCompany(),
                app.getJob().getLocation(),
                app.getStatus(),
                app.getCoverLetter(),
                app.getResumeUrl(),
                app.getAppliedAt()
        );
    }
}
