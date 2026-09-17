package com.talentgrid.backend.application.dto;

import com.talentgrid.backend.application.Application;
import com.talentgrid.backend.application.ApplicationStatus;
import com.talentgrid.backend.application.ApplicationStatusHistory;
import com.talentgrid.backend.job.Job;
import com.talentgrid.backend.job.dto.JobResponse;

import java.time.Instant;
import java.util.List;

/** One application with the role it was made to and the dated stage timeline. */
public record ApplicationDetailResponse(
        Long id,
        ApplicationStatus status,
        Instant appliedAt,
        String coverLetter,
        JobResponse job,
        Long companyId,
        List<Stage> timeline
) {
    public record Stage(ApplicationStatus status, String note, Instant changedAt) {}

    public static ApplicationDetailResponse from(Application app, List<ApplicationStatusHistory> history) {
        Job job = app.getJob();
        return new ApplicationDetailResponse(
                app.getId(),
                app.getStatus(),
                app.getAppliedAt(),
                app.getCoverLetter(),
                JobResponse.fromEntity(job),
                job.getCompanyProfile() == null ? null : job.getCompanyProfile().getId(),
                history.stream().map(h -> new Stage(h.getStatus(), h.getNote(), h.getChangedAt())).toList());
    }
}
