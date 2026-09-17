package com.talentgrid.backend.insight;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsightRepository extends JpaRepository<Insight, Long> {
    List<Insight> findByPublishedTrueOrderByPublishedAtDesc();
    List<Insight> findAllByOrderByPublishedAtDesc();
    Optional<Insight> findBySlugAndPublishedTrue(String slug);
    boolean existsBySlug(String slug);
}
