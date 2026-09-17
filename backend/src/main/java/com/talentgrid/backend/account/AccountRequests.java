package com.talentgrid.backend.account;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AccountRequests {
    private AccountRequests() {}

    public record ChangePassword(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8, max = 100) String newPassword) {}

    public record ChangeEmail(
            @NotBlank String password,
            @NotBlank @Email @Size(max = 255) String newEmail) {}

    /** Password is required for local accounts; social-only accounts have none. */
    public record DeleteAccount(String password) {}
}
