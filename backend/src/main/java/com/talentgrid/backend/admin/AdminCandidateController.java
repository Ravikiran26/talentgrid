package com.talentgrid.backend.admin;

import com.talentgrid.backend.admin.dto.CandidateDetailResponse;
import com.talentgrid.backend.admin.dto.CandidateSummaryResponse;
import com.talentgrid.backend.admin.dto.UpdateCandidateStatusRequest;
import com.talentgrid.backend.config.PageResponses;
import com.talentgrid.backend.resume.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/candidates")
@RequiredArgsConstructor
public class AdminCandidateController {

    private final AdminCandidateService adminCandidateService;

    @GetMapping
    public ResponseEntity<List<CandidateSummaryResponse>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) com.talentgrid.backend.user.CandidateStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponses.ok(adminCandidateService.listCandidates(q, status, pageable));
    }

    @GetMapping("/counts")
    public ResponseEntity<AdminCandidateService.StatusCounts> counts() {
        return ResponseEntity.ok(adminCandidateService.counts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CandidateDetailResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(adminCandidateService.getCandidate(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CandidateDetailResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCandidateStatusRequest req) {
        return ResponseEntity.ok(adminCandidateService.updateStatus(id, req.status()));
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<Resource> photo(@PathVariable Long id) {
        ResumeService.ResumeDownload d = adminCandidateService.loadPhotoFor(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(d.contentType()))
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=300")
                .body(new FileSystemResource(d.path()));
    }

    @GetMapping("/{id}/resume")
    public ResponseEntity<Resource> downloadResume(@PathVariable Long id) {
        ResumeService.ResumeDownload download = adminCandidateService.loadResumeFor(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + download.filename() + "\"")
                .body(new FileSystemResource(download.path()));
    }
}
