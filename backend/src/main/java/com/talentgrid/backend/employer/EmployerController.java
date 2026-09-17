package com.talentgrid.backend.employer;

import com.talentgrid.backend.admin.dto.AdminApplicantResponse;
import com.talentgrid.backend.admin.dto.UpdateApplicationStatusRequest;
import com.talentgrid.backend.company.CompanyRequest;
import com.talentgrid.backend.company.CompanyResponse;
import com.talentgrid.backend.company.CompanyService;
import com.talentgrid.backend.config.PageResponses;
import com.talentgrid.backend.job.dto.CreateJobRequest;
import com.talentgrid.backend.job.dto.JobResponse;
import com.talentgrid.backend.job.dto.UpdateJobRequest;
import com.talentgrid.backend.resume.ResumeService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
    private final CompanyService companyService;

    @GetMapping("/company")
    public ResponseEntity<CompanyResponse> myCompany(@AuthenticationPrincipal UserPrincipal principal) {
        return companyService.mine(principal.user())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping("/company")
    public ResponseEntity<CompanyResponse> saveCompany(@AuthenticationPrincipal UserPrincipal principal,
                                                       @Valid @RequestBody CompanyRequest req) {
        return ResponseEntity.ok(companyService.save(principal.user(), req));
    }

    @PatchMapping("/jobs/{id}/reactivate")
    public ResponseEntity<JobResponse> reactivateJob(@AuthenticationPrincipal UserPrincipal principal,
                                                     @PathVariable Long id) {
        return ResponseEntity.ok(employerService.reactivateJob(principal.user(), id));
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobResponse>> myJobs(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20, sort = "postedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponses.ok(employerService.listMyJobs(principal.user(), pageable));
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<JobResponse> myJob(@AuthenticationPrincipal UserPrincipal principal,
                                             @PathVariable Long id) {
        return ResponseEntity.ok(employerService.getMyJob(principal.user(), id));
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

    @GetMapping("/applications/{id}/photo")
    public ResponseEntity<Resource> applicantPhoto(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        ResumeService.ResumeDownload d = employerService.loadApplicantPhoto(principal.user(), id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(d.contentType()))
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=300")
                .body(new FileSystemResource(d.path()));
    }

    @GetMapping("/applications/{id}/resume")
    public ResponseEntity<Resource> applicantResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        ResumeService.ResumeDownload d = employerService.loadApplicantResume(principal.user(), id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(d.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + d.filename() + "\"")
                .body(new FileSystemResource(d.path()));
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
