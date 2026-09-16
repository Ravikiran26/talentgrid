package com.talentgrid.backend.auth.dto;

import com.talentgrid.backend.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(min = 2, max = 120) String fullName,
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "^[+0-9\\-\\s]{7,20}$", message = "invalid phone") String phone,
        @NotBlank
        @Size(min = 8, max = 100)
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "password must contain at least one letter and one digit")
        String password,
        Role role
) {}
