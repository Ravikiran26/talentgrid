package com.talentgrid.backend.insight;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/insights")
@RequiredArgsConstructor
public class AdminInsightController {

    private final InsightService insightService;

    @GetMapping
    public ResponseEntity<List<InsightResponse>> list() {
        return ResponseEntity.ok(insightService.listAll());
    }

    @PostMapping
    public ResponseEntity<InsightResponse> create(@Valid @RequestBody InsightRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(insightService.create(req));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<InsightResponse> update(@PathVariable Long id, @Valid @RequestBody InsightRequest req) {
        return ResponseEntity.ok(insightService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        insightService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
