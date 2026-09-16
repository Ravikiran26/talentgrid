package com.talentgrid.backend.profile.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateProfileRequest(
        @Size(max = 200) String headline,
        @Size(max = 120) String city,
        @PositiveOrZero Integer totalExp,
        @Size(max = 4000) String about,
        List<@Size(max = 60) String> skills,
        @Pattern(regexp = "^[+0-9\\-\\s]{7,20}$", message = "invalid phone") String phone
) {}
