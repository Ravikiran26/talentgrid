package com.talentgrid.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * One line per completed request: method, path, status and duration. Runs just inside
 * {@link CorrelationIdFilter} so every line carries the same request id as the application
 * logs it produced. Slow requests and failures are raised to WARN so they stand out.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Value("${app.logging.slow-request-ms:1000}")
    private long slowRequestMs;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long start = System.nanoTime();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long tookMs = (System.nanoTime() - start) / 1_000_000;
            int status = response.getStatus();
            String query = request.getQueryString();
            String path = request.getRequestURI() + (query == null ? "" : "?" + query);

            if (status >= 500 || tookMs >= slowRequestMs) {
                log.warn("{} {} -> {} ({} ms)", request.getMethod(), path, status, tookMs);
            } else if (status >= 400) {
                log.info("{} {} -> {} ({} ms)", request.getMethod(), path, status, tookMs);
            } else {
                log.debug("{} {} -> {} ({} ms)", request.getMethod(), path, status, tookMs);
            }
        }
    }

    /** Static assets and the error forward would only add noise. */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.startsWith("/error") || uri.startsWith("/actuator/health");
    }
}
