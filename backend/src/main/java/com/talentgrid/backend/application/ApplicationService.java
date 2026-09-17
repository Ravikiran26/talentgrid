package com.talentgrid.backend.application;

import com.talentgrid.backend.application.dto.ApplicationDetailResponse;
import com.talentgrid.backend.application.dto.ApplicationResponse;
import com.talentgrid.backend.application.dto.CreateApplicationRequest;
import com.talentgrid.backend.exception.ConflictException;
import com.talentgrid.backend.exception.ForbiddenException;
import com.talentgrid.backend.exception.NotFoundException;
import com.talentgrid.backend.job.Job;
import com.talentgrid.backend.job.JobService;
import com.talentgrid.backend.notification.NotificationService;
import com.talentgrid.backend.subscription.SubscriptionService;
import com.talentgrid.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobService jobService;
    private final SubscriptionService subscriptionService;
    private final NotificationService notificationService;
    private final ApplicationTracker tracker;

    @Transactional
    public ApplicationResponse apply(User user, CreateApplicationRequest req) {
        Job job = jobService.requireById(req.jobId());
        if (!job.isActive()) {
            throw new NotFoundException("Job not found: " + req.jobId());
        }
        if (applicationRepository.existsByUserIdAndJobId(user.getId(), req.jobId())) {
            throw new ConflictException("You have already applied to this job");
        }
        subscriptionService.assertCanApply(user);

        Application app = Application.builder()
                .user(user)
                .job(job)
                .status(ApplicationStatus.APPLIED)
                .coverLetter(req.coverLetter())
                .resumeUrl(req.resumeUrl())
                .build();

        Application saved = applicationRepository.save(app);
        tracker.record(saved, ApplicationStatus.APPLIED, ApplicationTracker.defaultNote(ApplicationStatus.APPLIED));
        notificationService.applicationReceived(saved);
        return ApplicationResponse.fromEntity(saved);
    }

    /** Full detail for the candidate's own application, including the stage timeline. */
    @Transactional(readOnly = true)
    public ApplicationDetailResponse getMine(User user, Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application not found: " + applicationId));
        if (!app.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You can only view your own applications");
        }
        return ApplicationDetailResponse.from(app, tracker.history(app.getId()));
    }

    @Transactional(readOnly = true)
    public Page<ApplicationResponse> listMine(User user, Pageable pageable) {
        return applicationRepository.findByUserId(user.getId(), pageable)
                .map(ApplicationResponse::fromEntity);
    }
}
