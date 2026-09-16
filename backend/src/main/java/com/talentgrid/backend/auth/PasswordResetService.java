package com.talentgrid.backend.auth;

import com.talentgrid.backend.auth.dto.ForgotPasswordRequest;
import com.talentgrid.backend.auth.dto.MessageResponse;
import com.talentgrid.backend.auth.dto.ResetPasswordRequest;
import com.talentgrid.backend.exception.BadRequestException;
import com.talentgrid.backend.user.User;
import com.talentgrid.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private static final Duration TOKEN_TTL = Duration.ofMinutes(15);
    private static final String GENERIC_RESPONSE =
            "If this email is registered, a reset link has been sent";

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest req) {
        Optional<User> maybeUser = userRepository.findByEmail(req.email());
        if (maybeUser.isPresent()) {
            User user = maybeUser.get();
            int invalidated = tokenRepository.invalidateActiveForUser(user.getId());
            if (invalidated > 0) {
                log.debug("Invalidated {} previous reset token(s) for userId={}", invalidated, user.getId());
            }
            String token = UUID.randomUUID().toString();
            PasswordResetToken entity = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiresAt(LocalDateTime.now().plus(TOKEN_TTL))
                    .used(false)
                    .build();
            tokenRepository.save(entity);
            log.info("Password reset token issued for userId={} email={}: {}",
                    user.getId(), req.email(), token);
        } else {
            log.debug("Forgot-password request for unknown email={}", req.email());
        }
        return new MessageResponse(GENERIC_RESPONSE);
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest req) {
        PasswordResetToken entity = tokenRepository.findByToken(req.token())
                .orElseThrow(() -> {
                    log.warn("Reset attempted with unknown token");
                    return new BadRequestException("Invalid or expired token");
                });

        if (entity.isUsed() || entity.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Reset attempted with used/expired token id={} userId={}",
                    entity.getId(), entity.getUser().getId());
            throw new BadRequestException("Invalid or expired token");
        }

        User user = entity.getUser();
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        entity.setUsed(true);
        log.info("Password reset completed for userId={}", user.getId());

        return new MessageResponse("Password has been reset");
    }
}
