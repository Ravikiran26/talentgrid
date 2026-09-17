package com.talentgrid.backend.admin.dto;

import com.talentgrid.backend.user.CandidateStatus;
import com.talentgrid.backend.user.User;

import java.time.Instant;
import java.util.List;

public record CandidateSummaryResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String city,
        Integer totalExp,
        String headline,
        List<String> skills,
        String about,
        CandidateStatus status,
        Instant appliedAt,
        int profileStrength,
        boolean hasResume,
        boolean hasPhoto
) {
    public static CandidateSummaryResponse fromEntity(User u) {
        String resume = u.getResumeFile();
        return new CandidateSummaryResponse(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getPhone(),
                u.getCity(),
                u.getTotalExp(),
                u.getHeadline(),
                u.getSkills() == null ? java.util.Collections.emptyList() : java.util.List.copyOf(u.getSkills()),
                u.getAbout(),
                u.getStatus(),
                u.getCreatedAt(),
                u.getProfileStrength(),
                resume != null && !resume.isBlank(),
                u.getPhotoFile() != null && !u.getPhotoFile().isBlank()
        );
    }
}
