package com.talentgrid.backend.insight;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightController {

    private final InsightService insightService;

    @GetMapping
    public ResponseEntity<List<InsightResponse>> list() {
        return ResponseEntity.ok(insightService.listPublished());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<InsightResponse> get(@PathVariable String slug) {
        return ResponseEntity.ok(insightService.getPublished(slug));
    }
}
