package com.talentgrid.backend.exception;

import com.talentgrid.backend.security.CorrelationIdFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.time.Instant;

/**
 * Writes the same JSON error shape the {@link GlobalExceptionHandler} produces.
 * Spring Security rejects requests inside the filter chain, before any controller
 * advice runs, so those responses have to be written here to stay consistent.
 */
public final class ApiErrorWriter {

    private ApiErrorWriter() {}

    public static void write(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        if (response.isCommitted()) return;
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        String requestId = MDC.get(CorrelationIdFilter.MDC_KEY);
        StringBuilder body = new StringBuilder(160)
                .append("{\"timestamp\":\"").append(Instant.now()).append('"')
                .append(",\"status\":").append(status.value())
                .append(",\"error\":\"").append(escape(status.getReasonPhrase())).append('"')
                .append(",\"message\":\"").append(escape(message)).append('"');
        if (requestId != null) {
            body.append(",\"requestId\":\"").append(escape(requestId)).append('"');
        }
        body.append('}');
        response.getWriter().write(body.toString());
    }

    private static String escape(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
