package com.talentgrid.backend.auth.oauth2;

import com.talentgrid.backend.user.AuthProvider;
import com.talentgrid.backend.user.CandidateStatus;
import com.talentgrid.backend.user.NameNormalizer;
import com.talentgrid.backend.user.Role;
import com.talentgrid.backend.user.User;
import com.talentgrid.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * Maps a successful Google / LinkedIn sign-in to a local {@link User}.
 *
 * <p>Both providers are configured as OpenID Connect clients, so the principal carries the
 * standard claims: {@code sub}, {@code email}, {@code email_verified}, {@code name}.
 * Accounts are matched by e-mail. To prevent takeover of an existing local account via a
 * provider account that merely <em>claims</em> the same address, the provider must assert
 * {@code email_verified=true}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2AccountService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User findOrCreate(String registrationId, OAuth2User principal) {
        AuthProvider provider = toProvider(registrationId);
        Map<String, Object> attrs = principal.getAttributes();

        String email = stringAttr(attrs, "email");
        if (email == null || email.isBlank()) {
            throw new OAuth2AccountException("email_missing",
                    provider + " did not return an e-mail address");
        }
        email = email.trim().toLowerCase(Locale.ROOT);

        if (!Boolean.TRUE.equals(attrs.get("email_verified"))) {
            throw new OAuth2AccountException("email_not_verified",
                    provider + " reports the e-mail address as unverified");
        }

        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User user = existing.get();
            if (user.getRole() == Role.ADMIN) {
                log.warn("Blocked social sign-in for ADMIN account email={} provider={}", email, provider);
                throw new OAuth2AccountException("admin_not_allowed",
                        "Administrator accounts must sign in with a password");
            }
            log.info("Social sign-in for existing user id={} email={} provider={}",
                    user.getId(), email, provider);
            return user;
        }

        User user = User.builder()
                .fullName(NameNormalizer.normalize(displayName(attrs, email)))
                .email(email)
                .phone("")
                .passwordHash(passwordEncoder.encode(randomSecret()))
                .role(Role.CANDIDATE)
                .status(CandidateStatus.UNDER_REVIEW)
                .authProvider(provider)
                .providerId(principal.getName())
                .build();

        User saved = userRepository.save(user);
        log.info("Registered user id={} email={} via {}", saved.getId(), saved.getEmail(), provider);
        return saved;
    }

    private static AuthProvider toProvider(String registrationId) {
        try {
            return AuthProvider.valueOf(registrationId.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new OAuth2AccountException("unknown_provider",
                    "Unsupported OAuth2 registration: " + registrationId);
        }
    }

    private static String displayName(Map<String, Object> attrs, String email) {
        String name = stringAttr(attrs, "name");
        if (name != null && !name.isBlank()) return name.trim();

        String given  = stringAttr(attrs, "given_name");
        String family = stringAttr(attrs, "family_name");
        String joined = ((given == null ? "" : given) + " " + (family == null ? "" : family)).trim();
        if (!joined.isBlank()) return joined;

        return email.substring(0, email.indexOf('@'));
    }

    private static String stringAttr(Map<String, Object> attrs, String key) {
        Object v = attrs.get(key);
        return v == null ? null : v.toString();
    }

    /** Social accounts have no usable password; users can set one via "forgot password". */
    private static String randomSecret() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
