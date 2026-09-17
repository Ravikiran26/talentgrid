package com.talentgrid.backend.application;

import com.talentgrid.backend.application.dto.ApplicationDetailResponse;
import com.talentgrid.backend.application.dto.ApplicationResponse;
import com.talentgrid.backend.application.dto.CreateApplicationRequest;
import com.talentgrid.backend.config.PageResponses;
import com.talentgrid.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<ApplicationResponse> apply(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateApplicationRequest req) {
        return ResponseEntity.ok(applicationService.apply(principal.user(), req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDetailResponse> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getMine(principal.user(), id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ApplicationResponse>> myApplications(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20, sort = "appliedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return PageResponses.ok(applicationService.listMine(principal.user(), pageable));
    }
}
