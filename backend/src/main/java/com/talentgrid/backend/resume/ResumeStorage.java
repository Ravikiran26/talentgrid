package com.talentgrid.backend.resume;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;

/**
 * Abstracts resume file storage. Local disk today; swap for S3 later
 * by adding a new bean without touching the controller/service.
 */
public interface ResumeStorage {

    /** Store bytes and return the storage key (opaque identifier saved on User.resumeFile). */
    String store(long userId, String extension, InputStream bytes) throws IOException;

    /** Resolve a storage key to a filesystem Path (for streaming download). */
    Path resolve(String storageKey);

    /** Delete a stored file. Silent if the key doesn't exist. */
    void delete(String storageKey) throws IOException;
}
