package com.talentgrid.backend.account;

import com.talentgrid.backend.application.ApplicationRepository;
import com.talentgrid.backend.application.ApplicationStatusHistoryRepository;
import com.talentgrid.backend.auth.AuthService;
import com.talentgrid.backend.auth.PasswordResetTokenRepository;
import com.talentgrid.backend.auth.dto.AuthResponse;
import com.talentgrid.backend.company.CompanyRepository;
import com.talentgrid.backend.exception.BadRequestException;
import com.talentgrid.backend.exception.ConflictException;
import com.talentgrid.backend.exception.ForbiddenException;
import com.talentgrid.backend.exception.NotFoundException;
import com.talentgrid.backend.job.JobRepository;
import com.talentgrid.backend.notification.NotificationRepository;
import com.talentgrid.backend.resume.ResumeStorage;
import com.talentgrid.backend.savedjob.SavedJobRepository;
import com.talentgrid.backend.subscription.SubscriptionRepository;
import com.talentgrid.backend.user.AuthProvider;
import com.talentgrid.backend.user.Role;
import com.talentgrid.backend.user.User;
import com.talentgrid.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository applicationStatusHistoryRepository;
    private final SavedJobRepository savedJobRepository;
    private final NotificationRepository notificationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JobRepository jobRepository;
    private final ResumeStorage storage;
    private final CompanyRepository companyRepository;

    @Transactional
    public void changePassword(User principal, AccountRequests.ChangePassword req) {
        User user = load(principal);
        verifyPassword(user, req.currentPassword());
        if (passwordEncoder.matches(req.newPassword(), user.getPasswordHash())) {
            throw new BadRequestException("New password must differ from the current one");
        }
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        passwordResetTokenRepository.invalidateActiveForUser(user.getId());
        log.info("Password changed userId={}", user.getId());
    }

    /** The JWT subject is the e-mail, so a fresh token is returned. */
    @Transactional
    public AuthResponse changeEmail(User principal, AccountRequests.ChangeEmail req) {
        User user = load(principal);
        verifyPassword(user, req.password());
        String email = req.newEmail().trim().toLowerCase(Locale.ROOT);
        if (email.equals(user.getEmail())) {
            throw new BadRequestException("That is already your e-mail address");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already registered");
        }
        log.info("E-mail changed userId={} from={} to={}", user.getId(), user.getEmail(), email);
        user.setEmail(email);
        return authService.authResponseFor(user);
    }

    @Transactional
    public void deleteAccount(User principal, AccountRequests.DeleteAccount req) {
        User user = load(principal);
        if (user.getRole() == Role.ADMIN) {
            throw new ForbiddenException("Administrator accounts cannot be deleted from the app");
        }
        if (user.getAuthProvider() == AuthProvider.LOCAL) {
            if (req == null || req.password() == null || req.password().isBlank()) {
                throw new BadRequestException("Password is required to delete your account");
            }
            verifyPassword(user, req.password());
        }

        Long id = user.getId();
        applicationStatusHistoryRepository.deleteByUserId(id);
        applicationRepository.deleteByUserId(id);
        savedJobRepository.deleteByUserId(id);
        notificationRepository.deleteByUserId(id);
        subscriptionRepository.deleteByUserId(id);
        passwordResetTokenRepository.deleteByUserId(id);
        jobRepository.detachPoster(id);          // employer's listings stay, unowned
        jobRepository.detachCompany(id);
        companyRepository.findByOwnerId(id).ifPresent(companyRepository::delete);
        deleteFile(user.getResumeFile(), id);
        deleteFile(user.getPhotoFile(), id);
        userRepository.delete(user);             // cascades skills / experience / education
        log.info("Account deleted userId={} email={}", id, user.getEmail());
    }

    private void verifyPassword(User user, String password) {
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadRequestException("Incorrect password");
        }
    }

    private User load(User principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new NotFoundException("User not found: " + principal.getId()));
    }

    private void deleteFile(String key, Long userId) {
        if (key == null || key.isBlank()) return;
        try {
            storage.delete(key);
        } catch (IOException e) {
            log.warn("Could not delete file {} for userId={}: {}", key, userId, e.getMessage());
        }
    }
}
