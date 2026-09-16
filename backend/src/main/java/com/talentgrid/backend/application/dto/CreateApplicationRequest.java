package com.talentgrid.backend.application.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateApplicationRequest(
        @NotNull Long jobId,
        @Size(max = 5000) String coverLetter,
        @Size(max = 500) String resumeUrl
) {}
