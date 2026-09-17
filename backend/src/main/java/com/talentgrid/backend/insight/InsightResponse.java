package com.talentgrid.backend.insight;

import java.time.Instant;

public record InsightResponse(Long id, String slug, String title, String category, String readTime,
                              String excerpt, String body, boolean published, Instant publishedAt) {
    public static InsightResponse fromEntity(Insight i, boolean includeBody) {
        return new InsightResponse(i.getId(), i.getSlug(), i.getTitle(), i.getCategory(), i.getReadTime(),
                i.getExcerpt(), includeBody ? i.getBody() : null, i.isPublished(), i.getPublishedAt());
    }
}
