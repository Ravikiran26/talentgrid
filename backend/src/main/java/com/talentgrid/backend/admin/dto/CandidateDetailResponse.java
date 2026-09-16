package com.talentgrid.backend.admin.dto;

import com.talentgrid.backend.user.CandidateStatus;
import com.talentgrid.backend.user.Education;
import com.talentgrid.backend.user.Experience;
import com.talentgrid.backend.user.User;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record CandidateDetailResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String city,
        String headline,
        Integer totalExp,
        List<String> skills,
        String about,
        String resumeFile,
        CandidateStatus status,
        int profileStrength,
        Instant appliedAt,
        List<ExperienceDto> experience,
        List<EducationDto> education
) {
    public record ExperienceDto(
            Long id,
            String title,
            String company,
            String location,
            LocalDate startDate,
            LocalDate endDate,
            boolean current,
            String description
    ) {
        static ExperienceDto from(Experience e) {
            return new ExperienceDto(
                    e.getId(),
                    e.getTitle(),
                    e.getCompany(),
                    e.getLocation(),
                    e.getStartDate(),
                    e.getEndDate(),
                    e.isCurrent(),
                    e.getDescription()
            );
        }
    }

    public record EducationDto(
            Long id,
            String institution,
            String degree,
            String fieldOfStudy,
            Integer startYear,
            Integer endYear,
            String grade
    ) {
        static EducationDto from(Education e) {
            return new EducationDto(
                    e.getId(),
                    e.getInstitution(),
                    e.getDegree(),
                    e.getFieldOfStudy(),
                    e.getStartYear(),
                    e.getEndYear(),
                    e.getGrade()
            );
        }
    }

    public static CandidateDetailResponse fromEntity(User u) {
        return new CandidateDetailResponse(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getPhone(),
                u.getCity(),
                u.getHeadline(),
                u.getTotalExp(),
                u.getSkills() == null ? java.util.Collections.emptyList() : java.util.List.copyOf(u.getSkills()),
                u.getAbout(),
                u.getResumeFile(),
                u.getStatus(),
                u.getProfileStrength(),
                u.getCreatedAt(),
                u.getExperience().stream().map(ExperienceDto::from).toList(),
                u.getEducation().stream().map(EducationDto::from).toList()
        );
    }
}
