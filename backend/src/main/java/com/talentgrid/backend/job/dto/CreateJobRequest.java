package com.talentgrid.backend.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateJobRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 200) String company,
        @Size(max = 10) String companyLogoInitials,
        @NotBlank @Size(max = 200) String location,
        @NotBlank @Size(max = 100) String category,
        @NotBlank @Size(max = 50) String employmentType,
        @PositiveOrZero Integer experienceMin,
        @PositiveOrZero Integer experienceMax,
        @PositiveOrZero Integer salaryMin,
        @PositiveOrZero Integer salaryMax,
        @PositiveOrZero Integer openings,
        List<String> skills,
        String description,
        List<String> responsibilities,
        List<String> requirements,
        @Size(max = 200) String education,
        String aboutCompany
) {}
