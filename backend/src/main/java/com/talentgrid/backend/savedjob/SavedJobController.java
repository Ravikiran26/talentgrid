package com.talentgrid.backend.savedjob;

import com.talentgrid.backend.job.dto.JobResponse;
import com.talentgrid.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-jobs")
@RequiredArgsConstructor
public class SavedJobController {

    private final SavedJobService savedJobService;

    @GetMapping
    public ResponseEntity<List<JobResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(savedJobService.list(principal.user()));
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> ids(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(savedJobService.ids(principal.user()));
    }

    @PostMapping("/{jobId}")
    public ResponseEntity<Void> save(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long jobId) {
        savedJobService.save(principal.user(), jobId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long jobId) {
        savedJobService.remove(principal.user(), jobId);
        return ResponseEntity.noContent().build();
    }
}
