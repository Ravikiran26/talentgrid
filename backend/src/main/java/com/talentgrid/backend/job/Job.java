package com.talentgrid.backend.job;

import com.talentgrid.backend.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "jobs",
        indexes = {
                @Index(name = "idx_jobs_active", columnList = "active"),
                @Index(name = "idx_jobs_category", columnList = "category"),
                @Index(name = "idx_jobs_location", columnList = "location"),
                @Index(name = "idx_jobs_posted_by", columnList = "posted_by"),
                @Index(name = "idx_jobs_posted_at", columnList = "posted_at")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    private String companyLogoInitials;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String employmentType;

    private Integer experienceMin;
    private Integer experienceMax;

    private Integer salaryMin;
    private Integer salaryMax;

    private Integer openings;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    @Fetch(FetchMode.SUBSELECT)
    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "job_responsibilities", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "responsibility", columnDefinition = "TEXT")
    @Fetch(FetchMode.SUBSELECT)
    @Builder.Default
    private List<String> responsibilities = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "job_requirements", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "requirement", columnDefinition = "TEXT")
    @Fetch(FetchMode.SUBSELECT)
    @Builder.Default
    private List<String> requirements = new ArrayList<>();

    private String education;

    @Column(columnDefinition = "TEXT")
    private String aboutCompany;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant postedAt;

    @Column(nullable = false)
    @ColumnDefault("true")
    @Builder.Default
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by")
    private User postedBy;

    /** Set when an employer with a company profile posts the job. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private com.talentgrid.backend.company.Company companyProfile;
}
