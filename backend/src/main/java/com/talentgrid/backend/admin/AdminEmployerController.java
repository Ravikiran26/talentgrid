package com.talentgrid.backend.admin;

import com.talentgrid.backend.admin.dto.EmployerSummaryResponse;
import com.talentgrid.backend.admin.dto.UpdateCandidateStatusRequest;
import com.talentgrid.backend.config.PageResponses;
import com.talentgrid.backend.user.CandidateStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/employers")
@RequiredArgsConstructor
public class AdminEmployerController {

    private final AdminEmployerService service;

    @GetMapping
    public ResponseEntity<List<EmployerSummaryResponse>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) CandidateStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponses.ok(service.list(q, status, pageable));
    }

    @GetMapping("/counts")
    public ResponseEntity<AdminCandidateService.StatusCounts> counts() {
        return ResponseEntity.ok(service.counts());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EmployerSummaryResponse> updateStatus(@PathVariable Long id,
                                                                @Valid @RequestBody UpdateCandidateStatusRequest req) {
        return ResponseEntity.ok(service.updateStatus(id, req.status()));
    }
}
