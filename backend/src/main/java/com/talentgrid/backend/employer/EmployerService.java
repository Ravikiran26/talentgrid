package com.talentgrid.backend.employer;

import com.talentgrid.backend.admin.dto.AdminApplicantResponse;
import com.talentgrid.backend.application.Application;
import com.talentgrid.backend.application.ApplicationRepository;
import com.talentgrid.backend.application.ApplicationStatus;
import com.talentgrid.backend.exception.BadRequestException;
import com.talentgrid.backend.exception.ForbiddenException;
import com.talentgrid.backend.exception.NotFoundException;
import com.talentgrid.backend.job.Job;
import com.talentgrid.backend.job.JobRepository;
import com.talentgrid.backend.job.JobService;
import com.talentgrid.backend.job.dto.CreateJobRequest;
import com.talentgrid.backend.job.dto.JobResponse;
import com.talentgrid.backend.job.dto.UpdateJobRequest;
import com.talentgrid.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EmployerService {

    private static final Set<ApplicationStatus> EMPLOYER_ALLOWED_STATUSES =
            EnumSet.of(ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED);

    private final JobRepository jobRepository;
    private final JobService jobService;
    private final ApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public Page<JobResponse> listMyJobs(User employer, Pageable pageable) {
        return jobRepository.findByPostedById(employer.getId(), pageable)
                .map(JobResponse::fromEntity);
    }

    @Transactional
    public JobResponse createJob(User employer, CreateJobRequest req) {
        return jobService.createFor(employer, req);
    }

    @Transactional
    public JobResponse updateJob(User employer, Long jobId, UpdateJobRequest req) {
        requireOwnedJob(employer, jobId);
        return jobService.update(jobId, req);
    }

    @Transactional
    public JobResponse deactivateJob(User employer, Long jobId) {
        requireOwnedJob(employer, jobId);
        return jobService.deactivate(jobId);
    }

    @Transactional(readOnly = true)
    public Page<AdminApplicantResponse> listApplicantsForJob(User employer, Long jobId, Pageable pageable) {
        requireOwnedJob(employer, jobId);
        return applicationRepository.findByJobId(jobId, pageable)
                .map(AdminApplicantResponse::fromEntity);
    }

    @Transactional
    public AdminApplicantResponse updateApplicationStatus(User employer, Long applicationId, ApplicationStatus status) {
        if (!EMPLOYER_ALLOWED_STATUSES.contains(status)) {
            throw new BadRequestException("Status must be one of " + EMPLOYER_ALLOWED_STATUSES);
        }
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application not found: " + applicationId));
        Job job = app.getJob();
        if (job.getPostedBy() == null || !job.getPostedBy().getId().equals(employer.getId())) {
            throw new ForbiddenException("You can only update applications on your own jobs");
        }
        app.setStatus(status);
        return AdminApplicantResponse.fromEntity(app);
    }

    private Job requireOwnedJob(User employer, Long jobId) {
        Job job = jobService.requireById(jobId);
        if (job.getPostedBy() == null || !job.getPostedBy().getId().equals(employer.getId())) {
            throw new ForbiddenException("You can only manage your own jobs");
        }
        return job;
    }
}
