package com.talentgrid.backend.job.dto;

import com.talentgrid.backend.job.Job;

import java.time.Instant;
import java.util.List;

import static java.util.Collections.emptyList;

public record JobResponse(
        Long id,
        String title,
        String company,
        String companyLogoInitials,
        String location,
        String category,
        String employmentType,
        Integer experienceMin,
        Integer experienceMax,
        Integer salaryMin,
        Integer salaryMax,
        Integer openings,
        List<String> skills,
        String description,
        List<String> responsibilities,
        List<String> requirements,
        String education,
        String aboutCompany,
        Instant postedAt,
        boolean active
) {
    public static JobResponse fromEntity(Job job) {
        return new JobResponse(
                job.getId(),
                job.getTitle(),
                job.getCompany(),
                job.getCompanyLogoInitials(),
                job.getLocation(),
                job.getCategory(),
                job.getEmploymentType(),
                job.getExperienceMin(),
                job.getExperienceMax(),
                job.getSalaryMin(),
                job.getSalaryMax(),
                job.getOpenings(),
                job.getSkills() == null ? emptyList() : List.copyOf(job.getSkills()),
                job.getDescription(),
                job.getResponsibilities() == null ? emptyList() : List.copyOf(job.getResponsibilities()),
                job.getRequirements() == null ? emptyList() : List.copyOf(job.getRequirements()),
                job.getEducation(),
                job.getAboutCompany(),
                job.getPostedAt(),
                job.isActive()
        );
    }
}
