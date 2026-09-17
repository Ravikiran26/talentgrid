package com.talentgrid.backend.auth.oauth2;

/**
 * Raised when a social sign-in completes at the provider but cannot be mapped to a
 * TalentGrid account. {@link #code()} is a short, URL-safe identifier the frontend
 * turns into a user-facing message.
 */
public class OAuth2AccountException extends RuntimeException {

    private final String code;

    public OAuth2AccountException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
