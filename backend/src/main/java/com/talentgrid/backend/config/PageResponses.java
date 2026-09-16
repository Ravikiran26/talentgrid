package com.talentgrid.backend.config;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import java.util.List;

public final class PageResponses {

    public static final String TOTAL_COUNT = "X-Total-Count";
    public static final String TOTAL_PAGES = "X-Total-Pages";

    private PageResponses() {}

    public static <T> ResponseEntity<List<T>> ok(Page<T> page) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(TOTAL_COUNT, String.valueOf(page.getTotalElements()));
        headers.set(TOTAL_PAGES, String.valueOf(page.getTotalPages()));
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
