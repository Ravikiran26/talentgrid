package com.talentgrid.backend.admin.dto;

import com.talentgrid.backend.application.Application;
import com.talentgrid.backend.application.ApplicationStatus;
import com.talentgrid.backend.user.CandidateStatus;
import com.talentgrid.backend.user.User;

import java.time.Instant;
import java.util.List;

public record AdminApplicantResponse(
        Long applicationId,
        ApplicationStatus status,
        Instant appliedAt,
        String coverLetter,
        String resumeUrl,
        Candidate candidate
) {
    public record Candidate(
            Long id,
            String fullName,
            String email,
            String phone,
            String headline,
            String city,
            Integer totalExp,
            List<String> skills,
            String about,
            String resumeFile,
            boolean hasPhoto,
            int profileStrength,
            CandidateStatus status
    ) {
        static Candidate from(User u) {
            return new Candidate(
                    u.getId(),
                    u.getFullName(),
                    u.getEmail(),
                    u.getPhone(),
                    u.getHeadline(),
                    u.getCity(),
                    u.getTotalExp(),
                    u.getSkills() == null ? java.util.Collections.emptyList() : java.util.List.copyOf(u.getSkills()),
                    u.getAbout(),
                    u.getResumeFile(),
                    u.getPhotoFile() != null && !u.getPhotoFile().isBlank(),
                    u.getProfileStrength(),
                    u.getStatus()
            );
        }
    }

    public static AdminApplicantResponse fromEntity(Application app) {
        return new AdminApplicantResponse(
                app.getId(),
                app.getStatus(),
                app.getAppliedAt(),
                app.getCoverLetter(),
                app.getResumeUrl(),
                Candidate.from(app.getUser())
        );
    }
}
