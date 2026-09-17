package com.talentgrid.backend.profile.dto;

import com.talentgrid.backend.user.CandidateStatus;
import com.talentgrid.backend.user.User;

import java.util.List;

public record ProfileResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String city,
        Integer totalExp,
        String headline,
        List<String> skills,
        String about,
        int profileStrength,
        CandidateStatus status,
        boolean hasResume,
        String resumeFileName,
        boolean hasPhoto,
        boolean canApply
) {
    public static ProfileResponse fromEntity(User u) {
        String resume = u.getResumeFile();
        boolean hasResume = resume != null && !resume.isBlank();
        return new ProfileResponse(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getPhone(),
                u.getCity(),
                u.getTotalExp(),
                u.getHeadline(),
                u.getSkills() == null ? java.util.Collections.emptyList() : java.util.List.copyOf(u.getSkills()),
                u.getAbout(),
                u.getProfileStrength(),
                u.getStatus(),
                hasResume,
                hasResume ? resume : null,
                hasText(u.getPhotoFile()),
                canApply(u)
        );
    }

    private static boolean canApply(User u) {
        return hasText(u.getHeadline())
                && u.getSkills() != null && !u.getSkills().isEmpty()
                && hasText(u.getResumeFile());
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }
}
