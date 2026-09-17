package com.talentgrid.backend.insight;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Create/update payload. Slug is derived from the title when blank. */
public record InsightRequest(
        @NotBlank @Size(max = 255) String title,
        @Size(max = 160) String slug,
        @NotBlank @Size(max = 80) String category,
        @Size(max = 30) String readTime,
        @NotBlank String excerpt,
        @NotBlank String body,
        Boolean published
) {}
