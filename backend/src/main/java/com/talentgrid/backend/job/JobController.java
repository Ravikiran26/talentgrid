package com.talentgrid.backend.job;

import com.talentgrid.backend.config.PageResponses;
import com.talentgrid.backend.job.dto.CreateJobRequest;
import com.talentgrid.backend.job.dto.JobResponse;
import com.talentgrid.backend.job.dto.UpdateJobRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<List<JobResponse>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @PageableDefault(size = 20, sort = "postedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponses.ok(jobService.search(q, category, location, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getById(id));
    }

    @PostMapping
    public ResponseEntity<JobResponse> create(@Valid @RequestBody CreateJobRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.create(req));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<JobResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateJobRequest req) {
        return ResponseEntity.ok(jobService.update(id, req));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<JobResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.deactivate(id));
    }
}
