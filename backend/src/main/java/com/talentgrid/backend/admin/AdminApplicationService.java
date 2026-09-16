package com.talentgrid.backend.admin;

import com.talentgrid.backend.admin.dto.AdminApplicantResponse;
import com.talentgrid.backend.application.Application;
import com.talentgrid.backend.application.ApplicationRepository;
import com.talentgrid.backend.application.ApplicationStatus;
import com.talentgrid.backend.exception.BadRequestException;
import com.talentgrid.backend.exception.NotFoundException;
import com.talentgrid.backend.job.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminApplicationService {

    private static final Set<ApplicationStatus> ADMIN_ALLOWED_STATUSES =
            EnumSet.of(ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED);

    private final ApplicationRepository applicationRepository;
    private final JobService jobService;

    @Transactional(readOnly = true)
    public Page<AdminApplicantResponse> listForJob(Long jobId, Pageable pageable) {
        jobService.requireById(jobId);
        return applicationRepository.findByJobId(jobId, pageable)
                .map(AdminApplicantResponse::fromEntity);
    }

    @Transactional
    public AdminApplicantResponse updateStatus(Long applicationId, ApplicationStatus status) {
        if (!ADMIN_ALLOWED_STATUSES.contains(status)) {
            throw new BadRequestException("Status must be one of " + ADMIN_ALLOWED_STATUSES);
        }
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application not found: " + applicationId));
        app.setStatus(status);
        return AdminApplicantResponse.fromEntity(app);
    }
}
