package com.talentgrid.backend.employer;

import com.talentgrid.backend.admin.dto.AdminApplicantResponse;
import com.talentgrid.backend.admin.dto.UpdateApplicationStatusRequest;
import com.talentgrid.backend.config.PageResponses;
import com.talentgrid.backend.job.dto.CreateJobRequest;
import com.talentgrid.backend.job.dto.JobResponse;
import com.talentgrid.backend.job.dto.UpdateJobRequest;
import com.talentgrid.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employer")
@RequiredArgsConstructor
public class EmployerController {

    private final EmployerService employerService;

    @GetMapping("/jobs")
    public ResponseEntity<List<JobResponse>> myJobs(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20, sort = "postedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponses.ok(employerService.listMyJobs(principal.user(), pageable));
    }

    @PostMapping("/jobs")
    public ResponseEntity<JobResponse> createJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateJobRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(employerService.createJob(principal.user(), req));
    }

    @PatchMapping("/jobs/{id}")
    public ResponseEntity<JobResponse> updateJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateJobRequest req) {
        return ResponseEntity.ok(employerService.updateJob(principal.user(), id, req));
    }

    @PatchMapping("/jobs/{id}/deactivate")
    public ResponseEntity<JobResponse> deactivateJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(employerService.deactivateJob(principal.user(), id));
    }

    @GetMapping("/jobs/{id}/applications")
    public ResponseEntity<List<AdminApplicantResponse>> applicantsForJob(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @PageableDefault(size = 20, sort = "appliedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponses.ok(employerService.listApplicantsForJob(principal.user(), id, pageable));
    }

    @PatchMapping("/applications/{id}/status")
    public ResponseEntity<AdminApplicantResponse> updateApplicationStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateApplicationStatusRequest req) {
        return ResponseEntity.ok(
                employerService.updateApplicationStatus(principal.user(), id, req.status()));
    }
}
