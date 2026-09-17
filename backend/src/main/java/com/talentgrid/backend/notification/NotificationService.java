package com.talentgrid.backend.notification;

import com.talentgrid.backend.application.Application;
import com.talentgrid.backend.application.ApplicationStatus;
import com.talentgrid.backend.exception.NotFoundException;
import com.talentgrid.backend.job.Job;
import com.talentgrid.backend.user.CandidateStatus;
import com.talentgrid.backend.user.Role;
import com.talentgrid.backend.user.User;
import com.talentgrid.backend.user.UserRepository;
import org.springframework.data.domain.Pageable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Creates in-app notifications and mirrors each one as an e-mail.
 * Every domain event that a user should hear about goes through here.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository repository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public record Feed(List<NotificationResponse> items, long unreadCount) {}

    @Transactional(readOnly = true)
    public Feed feed(User user) {
        List<NotificationResponse> items = repository.findTop20ByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(NotificationResponse::fromEntity).toList();
        return new Feed(items, repository.countByUserIdAndReadFalse(user.getId()));
    }

    @Transactional
    public NotificationResponse markRead(User user, Long id) {
        Notification n = repository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new NotFoundException("Notification not found: " + id));
        n.setRead(true);
        return NotificationResponse.fromEntity(n);
    }

    @Transactional
    public int markAllRead(User user) {
        return repository.markAllRead(user.getId());
    }

    // ---- domain events -------------------------------------------------------------------

    /** Employer hears that a candidate applied to one of their jobs. */
    @Transactional
    public void applicationReceived(Application app) {
        Job job = app.getJob();
        User employer = job.getPostedBy();
        if (employer == null) return;   // admin-seeded job: nobody to notify

        String msg = app.getUser().getFullName() + " applied for " + job.getTitle() + ".";
        push(employer, NotificationType.APPLICATION_RECEIVED, msg, "/employer/dashboard");
        emailService.send(employer.getEmail(),
                "New applicant for " + job.getTitle(),
                "Hello " + employer.getFullName() + ",\n\n" + msg
                        + "\n\nReview the application: " + frontendUrl + "/employer/dashboard"
                        + "\n\n— TalentGrid");
    }

    /** Candidate hears that their application was shortlisted or rejected. */
    @Transactional
    public void applicationStatusChanged(Application app, ApplicationStatus status) {
        Job job = app.getJob();
        User candidate = app.getUser();
        String msg = switch (status) {
            case UNDER_REVIEW -> "Your application for " + job.getTitle() + " at " + job.getCompany()
                    + " is being reviewed by the hiring team.";
            case SHORTLISTED  -> "Your application for " + job.getTitle() + " at " + job.getCompany()
                    + " was shortlisted.";
            case REJECTED     -> "Your application for " + job.getTitle() + " at " + job.getCompany()
                    + " was not taken forward.";
            case APPLIED      -> "Your application for " + job.getTitle() + " was received.";
        };
        push(candidate, NotificationType.APPLICATION_STATUS, msg, "/applications");
        emailService.send(candidate.getEmail(),
                "Update on your application: " + job.getTitle(),
                "Hello " + candidate.getFullName() + ",\n\n" + msg
                        + "\n\nView your applications: " + frontendUrl + "/applications"
                        + "\n\n— TalentGrid");
    }

    /** Candidate hears that their profile was activated or rejected by an admin. */
    @Transactional
    public void candidateStatusChanged(User candidate, CandidateStatus status) {
        String msg = switch (status) {
            case ACTIVE       -> "Your profile has been approved. You can now apply to roles.";
            case REJECTED     -> "Your profile was not approved at this time.";
            case UNDER_REVIEW -> "Your profile is under review.";
        };
        push(candidate, NotificationType.ACCOUNT_STATUS, msg, "/profile");
        emailService.send(candidate.getEmail(), "Your TalentGrid profile status",
                "Hello " + candidate.getFullName() + ",\n\n" + msg
                        + "\n\n" + frontendUrl + "/profile\n\n— TalentGrid");
    }

    /** Employer hears the outcome of admin verification. */
    @Transactional
    public void employerStatusChanged(User employer, CandidateStatus status) {
        String msg = switch (status) {
            case ACTIVE       -> "Your company account is verified. You can now post jobs.";
            case REJECTED     -> "Your company account was not approved. Open listings have been closed.";
            case UNDER_REVIEW -> "Your company account is under review.";
        };
        push(employer, NotificationType.ACCOUNT_STATUS, msg, "/employer/dashboard");
        emailService.send(employer.getEmail(), "Your TalentGrid employer account",
                "Hello " + employer.getFullName() + ",\n\n" + msg
                        + "\n\n" + frontendUrl + "/employer/dashboard\n\n— TalentGrid");
    }

    /** Every admin hears that a new employer is waiting for verification. */
    @Transactional
    public void employerRegistered(User employer) {
        String msg = "New employer registered: " + employer.getFullName() + " (" + employer.getEmail() + ") awaits verification.";
        for (User admin : userRepository.findAllByRole(Role.ADMIN, Pageable.unpaged())) {
            push(admin, NotificationType.ACCOUNT_STATUS, msg, "/admin/employers");
        }
    }

    @Transactional
    public void subscriptionChanged(User user, String msg) {
        push(user, NotificationType.SUBSCRIPTION, msg, "/subscription");
    }

    private void push(User user, NotificationType type, String message, String link) {
        repository.save(Notification.builder()
                .user(user).type(type).message(message).link(link).build());
        log.info("Notification {} for userId={}: {}", type, user.getId(), message);
    }
}
