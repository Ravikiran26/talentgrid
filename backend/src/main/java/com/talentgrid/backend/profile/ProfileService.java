package com.talentgrid.backend.profile;

import com.talentgrid.backend.exception.BadRequestException;
import com.talentgrid.backend.exception.NotFoundException;
import com.talentgrid.backend.profile.dto.ProfileResponse;
import com.talentgrid.backend.profile.dto.UpdateProfileRequest;
import com.talentgrid.backend.resume.ResumeService;
import com.talentgrid.backend.resume.ResumeStorage;
import com.talentgrid.backend.user.User;
import com.talentgrid.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("pdf", "doc", "docx");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final UserRepository userRepository;
    private final ResumeStorage resumeStorage;
    private final ResumeService resumeService;

    @Transactional(readOnly = true)
    public ProfileResponse getMe(User user) {
        return ProfileResponse.fromEntity(loadManaged(user));
    }

    @Transactional
    public ProfileResponse update(User user, UpdateProfileRequest req) {
        User managed = loadManaged(user);

        if (req.headline() != null) managed.setHeadline(req.headline());
        if (req.city() != null)     managed.setCity(req.city());
        if (req.totalExp() != null) managed.setTotalExp(req.totalExp());
        if (req.about() != null)    managed.setAbout(req.about());
        if (req.phone() != null)    managed.setPhone(req.phone());
        if (req.skills() != null) {
            managed.setSkills(new ArrayList<>(req.skills()));
        }

        return ProfileResponse.fromEntity(managed);
    }

    @Transactional
    public ProfileResponse uploadResume(User user, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Resume file is required");
        }

        String ext = extractExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BadRequestException("Allowed resume formats: PDF, DOC, DOCX");
        }
        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Allowed resume formats: PDF, DOC, DOCX");
        }

        User managed = loadManaged(user);
        String previous = managed.getResumeFile();

        String storageKey;
        try (var in = file.getInputStream()) {
            storageKey = resumeStorage.store(managed.getId(), ext, in);
        }
        managed.setResumeFile(storageKey);

        if (previous != null && !previous.isBlank()) {
            try {
                resumeStorage.delete(previous);
            } catch (IOException ex) {
                log.warn("Failed to delete previous resume {} for userId={}: {}",
                        previous, managed.getId(), ex.getMessage());
            }
        }
        log.info("Resume uploaded userId={} key={}", managed.getId(), storageKey);
        return ProfileResponse.fromEntity(managed);
    }

    @Transactional
    public ProfileResponse deleteResume(User user) throws IOException {
        User managed = loadManaged(user);
        String key = managed.getResumeFile();
        if (key == null || key.isBlank()) {
            throw new NotFoundException("No resume on file");
        }
        managed.setResumeFile(null);
        resumeStorage.delete(key);
        log.info("Resume deleted userId={} key={}", managed.getId(), key);
        return ProfileResponse.fromEntity(managed);
    }

    @Transactional(readOnly = true)
    public ResumeService.ResumeDownload loadResumeForDownload(User user) {
        return resumeService.loadFor(loadManaged(user));
    }

    private User loadManaged(User user) {
        return userRepository.findById(user.getId())
                .orElseThrow(() -> new NotFoundException("User not found: " + user.getId()));
    }

    private static String extractExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) return "";
        return filename.substring(dot + 1).toLowerCase();
    }
}
