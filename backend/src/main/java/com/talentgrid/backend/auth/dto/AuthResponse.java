package com.talentgrid.backend.auth.dto;

import com.talentgrid.backend.user.CandidateStatus;
import com.talentgrid.backend.user.Role;

public record AuthResponse(
        String token,
        long expiresInMs,
        UserSummary user
) {
    public record UserSummary(Long id, String fullName, String email, Role role, CandidateStatus status) {}
}
