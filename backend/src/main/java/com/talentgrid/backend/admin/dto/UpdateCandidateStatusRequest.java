package com.talentgrid.backend.admin.dto;

import com.talentgrid.backend.user.CandidateStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateCandidateStatusRequest(
        @NotNull CandidateStatus status
) {}
