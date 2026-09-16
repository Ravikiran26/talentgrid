package com.talentgrid.backend.config;

import com.talentgrid.backend.user.CandidateStatus;
import com.talentgrid.backend.user.Role;
import com.talentgrid.backend.user.User;
import com.talentgrid.backend.user.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(1)
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private static final String DEFAULT_ADMIN_PASSWORD = "Admin@123";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email:admin@talentgrid.com}") String adminEmail,
            @Value("${app.admin.password:" + DEFAULT_ADMIN_PASSWORD + "}") String adminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        if (DEFAULT_ADMIN_PASSWORD.equals(adminPassword)) {
            log.warn("!!! Admin user is being seeded with the DEFAULT password. Set APP_ADMIN_PASSWORD env var before production.");
        }

        User admin = User.builder()
                .fullName("TalentGrid Admin")
                .email(adminEmail)
                .phone("+910000000000")
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .status(CandidateStatus.ACTIVE)
                .build();

        userRepository.save(admin);
        log.info("Seeded default admin user: {}", adminEmail);
    }
}
