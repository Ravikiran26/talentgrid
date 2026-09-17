package com.talentgrid.backend.application;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

/** One entry per stage an application has reached. Drives the candidate's status tracker. */
@Entity
@Table(name = "application_status_history",
        indexes = @Index(name = "idx_application_status_history_app", columnList = "application_id,changed_at"))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    private String note;

    @Column(nullable = false, updatable = false)
    private Instant changedAt;

    @PrePersist
    void defaultChangedAt() {
        if (changedAt == null) changedAt = Instant.now();
    }
}
