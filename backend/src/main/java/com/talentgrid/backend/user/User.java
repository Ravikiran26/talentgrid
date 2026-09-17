package com.talentgrid.backend.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_users_role", columnList = "role"),
                @Index(name = "idx_users_role_status", columnList = "role,status")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStatus status;

    /** How the account was created. Social accounts get a random, unusable password hash. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    /** Stable subject id from the identity provider (Google / LinkedIn "sub"). */
    private String providerId;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private String headline;
    private String city;
    private Integer totalExp;

    @Column(columnDefinition = "TEXT")
    private String about;

    private String resumeFile;

    /** Storage key of the profile photo (same store as resumes). */
    private String photoFile;

    @Column(nullable = false)
    @Builder.Default
    private int profileStrength = 0;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_skills", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "skill")
    @Fetch(FetchMode.SUBSELECT)
    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Fetch(FetchMode.SUBSELECT)
    @Builder.Default
    private List<Experience> experience = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Fetch(FetchMode.SUBSELECT)
    @Builder.Default
    private List<Education> education = new ArrayList<>();

    @PrePersist
    @PreUpdate
    void recomputeProfileStrength() {
        int score = 0;
        if (hasText(fullName)) score += 15;
        if (hasText(headline)) score += 20;
        if (hasText(phone))    score += 10;
        if (hasText(city))     score += 10;
        if (totalExp != null)  score += 10;
        if (hasText(about))    score += 10;
        if (skills != null && !skills.isEmpty()) score += 15;
        if (hasText(resumeFile)) score += 10;
        this.profileStrength = score;
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }
}
