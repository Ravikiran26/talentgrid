package com.talentgrid.backend.admin.dto;

import com.talentgrid.backend.application.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateApplicationStatusRequest(
        @NotNull ApplicationStatus status
) {}
