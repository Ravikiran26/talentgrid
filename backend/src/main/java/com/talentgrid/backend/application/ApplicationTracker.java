package com.talentgrid.backend.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Writes the status timeline. Every status change in the app goes through here. */
@Service
@RequiredArgsConstructor
public class ApplicationTracker {

    private final ApplicationStatusHistoryRepository repository;

    @Transactional
    public void record(Application app, ApplicationStatus status, String note) {
        repository.save(ApplicationStatusHistory.builder()
                .application(app).status(status).note(note).build());
    }

    @Transactional(readOnly = true)
    public List<ApplicationStatusHistory> history(Long applicationId) {
        return repository.findByApplicationIdOrderByChangedAtAsc(applicationId);
    }

    public static String defaultNote(ApplicationStatus status) {
        return switch (status) {
            case APPLIED      -> "Application submitted";
            case UNDER_REVIEW -> "The hiring team is reviewing your profile";
            case SHORTLISTED  -> "You have been shortlisted for this role";
            case REJECTED     -> "The hiring team decided not to move forward";
        };
    }
}
