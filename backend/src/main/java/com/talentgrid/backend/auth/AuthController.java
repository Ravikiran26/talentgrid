package com.talentgrid.backend.auth;

import com.talentgrid.backend.auth.dto.AuthResponse;
import com.talentgrid.backend.auth.dto.ForgotPasswordRequest;
import com.talentgrid.backend.auth.dto.LoginRequest;
import com.talentgrid.backend.auth.dto.MessageResponse;
import com.talentgrid.backend.auth.dto.RegisterRequest;
import com.talentgrid.backend.auth.dto.ResetPasswordRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        return ResponseEntity.ok(passwordResetService.forgotPassword(req));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        return ResponseEntity.ok(passwordResetService.resetPassword(req));
    }
}
