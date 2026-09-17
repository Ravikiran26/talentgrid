package com.talentgrid.backend.profile;

import com.talentgrid.backend.profile.dto.ProfileResponse;
import com.talentgrid.backend.profile.dto.UpdateProfileRequest;
import com.talentgrid.backend.resume.ResumeService;
import com.talentgrid.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(profileService.getMe(principal.user()));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(profileService.update(principal.user(), req));
    }

    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> uploadResume(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(profileService.uploadResume(principal.user(), file));
    }

    @GetMapping("/resume")
    public ResponseEntity<Resource> downloadResume(@AuthenticationPrincipal UserPrincipal principal) {
        ResumeService.ResumeDownload download = profileService.loadResumeForDownload(principal.user());
        Resource resource = new FileSystemResource(download.path());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + download.filename() + "\"")
                .body(resource);
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> uploadPhoto(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(profileService.uploadPhoto(principal.user(), file));
    }

    @GetMapping("/photo")
    public ResponseEntity<Resource> photo(@AuthenticationPrincipal UserPrincipal principal) {
        ResumeService.ResumeDownload download = profileService.loadPhoto(principal.user());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.contentType()))
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=300")
                .body(new FileSystemResource(download.path()));
    }

    @DeleteMapping("/photo")
    public ResponseEntity<ProfileResponse> deletePhoto(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(profileService.deletePhoto(principal.user()));
    }

    @DeleteMapping("/resume")
    public ResponseEntity<ProfileResponse> deleteResume(
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        return ResponseEntity.ok(profileService.deleteResume(principal.user()));
    }
}
