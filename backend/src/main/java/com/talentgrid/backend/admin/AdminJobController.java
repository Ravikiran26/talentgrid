package com.talentgrid.backend.admin;

import com.talentgrid.backend.config.PageResponses;
import com.talentgrid.backend.job.JobService;
import com.talentgrid.backend.job.dto.JobResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Admin listing that includes closed jobs, unlike the public /api/jobs. */
@RestController
@RequestMapping("/api/admin/jobs")
@RequiredArgsConstructor
public class AdminJobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<List<JobResponse>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean active,
            @PageableDefault(size = 20, sort = "postedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponses.ok(jobService.adminSearch(q, active, pageable));
    }
}
