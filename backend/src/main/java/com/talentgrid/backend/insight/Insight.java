package com.talentgrid.backend.insight;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/** Editorial article shown under "Career Insights". Body is plain text: blank-line paragraphs, "## " headings. */
@Entity
@Table(name = "insights", indexes = @Index(name = "idx_insights_published", columnList = "published,published_at"))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Insight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(nullable = false, unique = true, length = 160)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(nullable = false, length = 30)
    private String readTime;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String excerpt;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false)
    @Builder.Default
    private boolean published = true;

    @Column(nullable = false)
    private Instant publishedAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
