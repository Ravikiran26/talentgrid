package com.talentgrid.backend.resume;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Disk-backed storage. Files land under {@code app.resume.storage-dir}.
 * Not multi-instance safe — swap for an S3-backed impl before horizontal scale-out.
 */
@Component
@Slf4j
public class LocalResumeStorage implements ResumeStorage {

    private final Path root;

    public LocalResumeStorage(@Value("${app.resume.storage-dir:./data/resumes}") String dir) {
        this.root = Paths.get(dir).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() throws IOException {
        Files.createDirectories(root);
        log.info("Resume storage initialised at {}", root);
    }

    @Override
    public String store(long userId, String extension, InputStream bytes) throws IOException {
        String key = userId + "_" + UUID.randomUUID() + "." + extension;
        Path target = safeResolve(key);
        Files.copy(bytes, target, StandardCopyOption.REPLACE_EXISTING);
        return key;
    }

    @Override
    public Path resolve(String storageKey) {
        return safeResolve(storageKey);
    }

    @Override
    public void delete(String storageKey) throws IOException {
        Files.deleteIfExists(safeResolve(storageKey));
    }

    /** Prevents path traversal — the resolved path must stay under {@code root}. */
    private Path safeResolve(String storageKey) {
        Path resolved = root.resolve(storageKey).normalize();
        if (!resolved.startsWith(root)) {
            throw new IllegalArgumentException("Invalid storage key: " + storageKey);
        }
        return resolved;
    }
}
