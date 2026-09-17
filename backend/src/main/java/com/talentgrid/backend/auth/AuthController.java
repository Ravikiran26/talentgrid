package com.talentgrid.backend.auth;

import com.talentgrid.backend.auth.dto.AuthResponse;
import com.talentgrid.backend.auth.dto.ForgotPasswordRequest;
import com.talentgrid.backend.auth.dto.LoginRequest;
import com.talentgrid.backend.auth.dto.MessageResponse;
import com.talentgrid.backend.auth.dto.RegisterRequest;
import com.talentgrid.backend.auth.dto.ResetPasswordRequest;
import com.talentgrid.backend.security.UserPrincipal;
import com.talentgrid.backend.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /** Resolves the bearer token to its user. Used by the social sign-in callback page. */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserSummary> me(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User u = principal.user();
        return ResponseEntity.ok(new AuthResponse.UserSummary(
                u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getStatus(), u.getAuthProvider()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        return ResponseEntity.ok(passwordResetService.forgotPassword(req));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        return ResponseEntity.ok(passwordResetService.resetPassword(req));
    }
}
