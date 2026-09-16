package com.talentgrid.backend.resume;

import com.talentgrid.backend.exception.NotFoundException;
import com.talentgrid.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.file.Path;

/** Shared resume lookup used by both candidate self-download and admin/employer viewing. */
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeStorage storage;

    public ResumeDownload loadFor(User user) {
        String key = user.getResumeFile();
        if (key == null || key.isBlank()) {
            throw new NotFoundException("No resume on file");
        }
        Path path = storage.resolve(key);
        return new ResumeDownload(path, resolveContentType(key), key);
    }

    public void delete(String storageKey) throws java.io.IOException {
        storage.delete(storageKey);
    }

    public static String resolveContentType(String key) {
        String ext = key == null ? "" : key.substring(key.lastIndexOf('.') + 1).toLowerCase();
        return switch (ext) {
            case "pdf"  -> "application/pdf";
            case "doc"  -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            default     -> "application/octet-stream";
        };
    }

    public record ResumeDownload(Path path, String contentType, String filename) {}
}
