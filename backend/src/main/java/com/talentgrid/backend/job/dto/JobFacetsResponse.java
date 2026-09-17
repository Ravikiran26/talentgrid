package com.talentgrid.backend.job.dto;

import java.util.List;

/** Distinct filter values that exist in the database, with counts. */
public record JobFacetsResponse(List<Facet> categories, List<Facet> locations, List<Facet> companies) {
    public record Facet(String value, long count) {}
}
