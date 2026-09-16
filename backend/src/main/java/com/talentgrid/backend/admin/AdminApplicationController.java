package com.talentgrid.backend.admin;

import com.talentgrid.backend.admin.dto.AdminApplicantResponse;
import com.talentgrid.backend.admin.dto.UpdateApplicationStatusRequest;
import com.talentgrid.backend.config.PageResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminApplicationController {

    private final AdminApplicationService adminApplicationService;

    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<List<AdminApplicantResponse>> listForJob(
            @PathVariable Long jobId,
            @PageableDefault(size = 20, sort = "appliedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponses.ok(adminApplicationService.listForJob(jobId, pageable));
    }

    @PatchMapping("/applications/{applicationId}/status")
    public ResponseEntity<AdminApplicantResponse> updateStatus(
            @PathVariable Long applicationId,
            @Valid @RequestBody UpdateApplicationStatusRequest req) {
        return ResponseEntity.ok(adminApplicationService.updateStatus(applicationId, req.status()));
    }
}
