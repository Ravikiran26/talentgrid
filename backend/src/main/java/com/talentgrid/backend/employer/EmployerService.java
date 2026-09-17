package com.talentgrid.backend.employer;

import com.talentgrid.backend.admin.dto.AdminApplicantResponse;
import com.talentgrid.backend.application.Application;
import com.talentgrid.backend.application.ApplicationRepository;
import com.talentgrid.backend.application.ApplicationStatus;
import com.talentgrid.backend.application.ApplicationTracker;
import com.talentgrid.backend.company.Company;
import com.talentgrid.backend.company.CompanyService;
import com.talentgrid.backend.user.CandidateStatus;
import com.talentgrid.backend.exception.BadRequestException;
import com.talentgrid.backend.exception.ForbiddenException;
import com.talentgrid.backend.exception.NotFoundException;
import com.talentgrid.backend.job.Job;
import com.talentgrid.backend.job.JobRepository;
import com.talentgrid.backend.job.JobService;
import com.talentgrid.backend.job.dto.CreateJobRequest;
import com.talentgrid.backend.job.dto.JobResponse;
import com.talentgrid.backend.job.dto.UpdateJobRequest;
import com.talentgrid.backend.notification.NotificationService;
import com.talentgrid.backend.resume.ResumeService;
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
            EnumSet.of(ApplicationStatus.UNDER_REVIEW, ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED);

    private final JobRepository jobRepository;
    private final JobService jobService;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final com.talentgrid.backend.application.ApplicationTracker tracker;
    private final ResumeService resumeService;
    private final CompanyService companyService;
    private final com.talentgrid.backend.resume.ResumeStorage resumeStorage;

    @Transactional(readOnly = true)
    public Page<JobResponse> listMyJobs(User employer, Pageable pageable) {
        return jobRepository.findByPostedById(employer.getId(), pageable)
                .map(j -> JobResponse.fromEntity(j, applicationRepository.countByJobId(j.getId())));
    }

    /** Posting requires a verified account. The company profile, when present, names the job. */
    @Transactional(readOnly = true)
    public JobResponse getMyJob(User employer, Long jobId) {
        Job job = requireOwnedJob(employer, jobId);
        return JobResponse.fromEntity(job, applicationRepository.countByJobId(job.getId()));
    }

    @Transactional
    public JobResponse createJob(User employer, CreateJobRequest req) {
        requireVerified(employer);
        Company company = companyService.findForOwner(employer).orElse(null);
        if (company == null && (req.company() == null || req.company().isBlank())) {
            throw new BadRequestException("Add your company profile before posting, or enter a company name");
        }
        Job job = jobService.buildJobEntity(req);
        job.setPostedBy(employer);
        if (company != null) {
            job.setCompanyProfile(company);
            job.setCompany(company.getName());
            job.setCompanyLogoInitials(company.getLogoInitials());
            if (job.getAboutCompany() == null || job.getAboutCompany().isBlank()) {
                job.setAboutCompany(company.getDescription());
            }
        }
        return JobResponse.fromEntity(jobRepository.save(job), 0L);
    }

    @Transactional
    public JobResponse updateJob(User employer, Long jobId, UpdateJobRequest req) {
        requireVerified(employer);
        Job job = requireOwnedJob(employer, jobId);
        JobResponse updated = jobService.update(jobId, req);
        if (job.getCompanyProfile() != null) {
            // Company identity comes from the profile, not the form.
            job.setCompany(job.getCompanyProfile().getName());
            job.setCompanyLogoInitials(job.getCompanyProfile().getLogoInitials());
            updated = JobResponse.fromEntity(job);
        }
        return updated;
    }

    @Transactional
    public JobResponse deactivateJob(User employer, Long jobId) {
        requireOwnedJob(employer, jobId);
        return jobService.deactivate(jobId);
    }

    @Transactional
    public JobResponse reactivateJob(User employer, Long jobId) {
        requireVerified(employer);
        requireOwnedJob(employer, jobId);
        return jobService.reactivate(jobId);
    }

    private static void requireVerified(User employer) {
        if (employer.getStatus() != CandidateStatus.ACTIVE) {
            throw new ForbiddenException(employer.getStatus() == CandidateStatus.REJECTED
                    ? "Your company account was not approved. Contact TalentGrid for help."
                    : "Your company account is pending verification. You can post jobs once an administrator approves it.");
        }
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
        if (app.getStatus() != status) {
            app.setStatus(status);
            tracker.record(app, status, ApplicationTracker.defaultNote(status));
            notificationService.applicationStatusChanged(app, status);
        }
        return AdminApplicantResponse.fromEntity(app);
    }

    /** Photo of an applicant to one of this employer's own jobs. */
    @Transactional(readOnly = true)
    public ResumeService.ResumeDownload loadApplicantPhoto(User employer, Long applicationId) {
        User candidate = requireApplicantOnOwnJob(employer, applicationId).getUser();
        String key = candidate.getPhotoFile();
        if (key == null || key.isBlank()) throw new NotFoundException("No photo on file");
        String ext = key.substring(key.lastIndexOf('.') + 1).toLowerCase();
        String type = switch (ext) { case "png" -> "image/png"; case "webp" -> "image/webp"; default -> "image/jpeg"; };
        return new ResumeService.ResumeDownload(resumeStorage.resolve(key), type, key);
    }

    private Application requireApplicantOnOwnJob(User employer, Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application not found: " + applicationId));
        Job job = app.getJob();
        if (job.getPostedBy() == null || !job.getPostedBy().getId().equals(employer.getId())) {
            throw new ForbiddenException("You can only view applicants on your own jobs");
        }
        return app;
    }

    /** Resume of an applicant to one of this employer's own jobs. */
    @Transactional(readOnly = true)
    public ResumeService.ResumeDownload loadApplicantResume(User employer, Long applicationId) {
        return resumeService.loadFor(requireApplicantOnOwnJob(employer, applicationId).getUser());
    }

    private Job requireOwnedJob(User employer, Long jobId) {
        Job job = jobService.requireById(jobId);
        if (job.getPostedBy() == null || !job.getPostedBy().getId().equals(employer.getId())) {
            throw new ForbiddenException("You can only manage your own jobs");
        }
        return job;
    }
}
