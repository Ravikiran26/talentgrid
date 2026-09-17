package com.talentgrid.backend.auth;

import com.talentgrid.backend.auth.dto.AuthResponse;
import com.talentgrid.backend.auth.dto.LoginRequest;
import com.talentgrid.backend.auth.dto.RegisterRequest;
import com.talentgrid.backend.exception.BadRequestException;
import com.talentgrid.backend.exception.ConflictException;
import com.talentgrid.backend.security.JwtService;
import com.talentgrid.backend.user.CandidateStatus;
import com.talentgrid.backend.user.NameNormalizer;
import com.talentgrid.backend.user.Role;
import com.talentgrid.backend.user.User;
import com.talentgrid.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final com.talentgrid.backend.notification.NotificationService notificationService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ConflictException("Email already registered");
        }

        Role role = req.role() == null ? Role.CANDIDATE : req.role();
        if (role == Role.ADMIN) {
            log.warn("Blocked self-registration attempt as ADMIN for email={}", req.email());
            throw new BadRequestException("Cannot self-register as ADMIN");
        }
        // Candidates and employers both start under review; admins verify employers before they can post.
        CandidateStatus status = CandidateStatus.UNDER_REVIEW;

        User user = User.builder()
                .fullName(NameNormalizer.normalize(req.fullName()))
                .email(req.email())
                .phone(req.phone())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(role)
                .status(status)
                .build();

        User saved = userRepository.save(user);
        log.info("Registered user id={} email={} role={}", saved.getId(), saved.getEmail(), saved.getRole());
        if (role == Role.EMPLOYER) notificationService.employerRegistered(saved);
        return authResponseFor(saved);
    }

    public AuthResponse login(LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        } catch (BadCredentialsException e) {
            log.warn("Failed login attempt for email={}", req.email());
            throw new BadRequestException("Invalid email or password");
        }

        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        log.info("Login success user id={} email={}", user.getId(), user.getEmail());
        return authResponseFor(user);
    }

    /** Issues a JWT for an already-authenticated user (password login or social sign-in). */
    public AuthResponse authResponseFor(User user) {
        String token = jwtService.generateToken(
                user.getEmail(),
                Map.of("role", user.getRole().name(), "uid", user.getId())
        );
        return new AuthResponse(
                token,
                jwtService.getExpirationMs(),
                new AuthResponse.UserSummary(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getStatus(),
                        user.getAuthProvider()
                )
        );
    }
}
