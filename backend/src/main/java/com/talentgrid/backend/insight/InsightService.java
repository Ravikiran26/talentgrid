package com.talentgrid.backend.insight;

import com.talentgrid.backend.exception.ConflictException;
import com.talentgrid.backend.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class InsightService {

    private final InsightRepository repository;

    @Transactional(readOnly = true)
    public List<InsightResponse> listPublished() {
        return repository.findByPublishedTrueOrderByPublishedAtDesc().stream()
                .map(i -> InsightResponse.fromEntity(i, false)).toList();
    }

    @Transactional(readOnly = true)
    public InsightResponse getPublished(String slug) {
        return repository.findBySlugAndPublishedTrue(slug)
                .map(i -> InsightResponse.fromEntity(i, true))
                .orElseThrow(() -> new NotFoundException("Insight not found: " + slug));
    }

    @Transactional(readOnly = true)
    public List<InsightResponse> listAll() {
        return repository.findAllByOrderByPublishedAtDesc().stream()
                .map(i -> InsightResponse.fromEntity(i, true)).toList();
    }

    @Transactional
    public InsightResponse create(InsightRequest req) {
        String slug = slugOrDerive(req);
        if (repository.existsBySlug(slug)) {
            throw new ConflictException("An insight with slug '" + slug + "' already exists");
        }
        Insight i = Insight.builder()
                .slug(slug)
                .title(req.title().trim())
                .category(req.category().trim())
                .readTime(readTimeOrEstimate(req))
                .excerpt(req.excerpt().trim())
                .body(req.body().trim())
                .published(req.published() == null || req.published())
                .publishedAt(Instant.now())
                .build();
        return InsightResponse.fromEntity(repository.save(i), true);
    }

    @Transactional
    public InsightResponse update(Long id, InsightRequest req) {
        Insight i = repository.findById(id).orElseThrow(() -> new NotFoundException("Insight not found: " + id));
        String slug = slugOrDerive(req);
        if (!slug.equals(i.getSlug()) && repository.existsBySlug(slug)) {
            throw new ConflictException("An insight with slug '" + slug + "' already exists");
        }
        i.setSlug(slug);
        i.setTitle(req.title().trim());
        i.setCategory(req.category().trim());
        i.setReadTime(readTimeOrEstimate(req));
        i.setExcerpt(req.excerpt().trim());
        i.setBody(req.body().trim());
        if (req.published() != null) i.setPublished(req.published());
        return InsightResponse.fromEntity(i, true);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) throw new NotFoundException("Insight not found: " + id);
        repository.deleteById(id);
    }

    private static String slugOrDerive(InsightRequest req) {
        String base = req.slug() == null || req.slug().isBlank() ? req.title() : req.slug();
        return slugify(base);
    }

    private static String readTimeOrEstimate(InsightRequest req) {
        if (req.readTime() != null && !req.readTime().isBlank()) return req.readTime().trim();
        int words = req.body().trim().split("\\s+").length;
        return Math.max(1, Math.round(words / 200f)) + " min read";
    }

    public static String slugify(String s) {
        String n = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        n = n.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        return n.length() > 160 ? n.substring(0, 160) : n;
    }
}
