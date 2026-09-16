package com.talentgrid.backend.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Per-IP rate limiter for /api/auth/**. In-memory token buckets — safe for single-instance deploys.
 * For multi-instance, back this with Redis via bucket4j-redis.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_TRACKED_KEYS = 100_000;

    private record LimitPolicy(String bucketKey, Bandwidth bandwidth) {}

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private LimitPolicy policyFor(HttpServletRequest req) {
        String path = req.getRequestURI();
        String method = req.getMethod();
        if (!"POST".equals(method)) return null;

        return switch (path) {
            case "/api/auth/login" ->
                    new LimitPolicy("login:" + clientIp(req),
                            Bandwidth.builder().capacity(10).refillGreedy(10, Duration.ofMinutes(1)).build());
            case "/api/auth/register" ->
                    new LimitPolicy("register:" + clientIp(req),
                            Bandwidth.builder().capacity(5).refillGreedy(5, Duration.ofHours(1)).build());
            case "/api/auth/forgot-password" ->
                    new LimitPolicy("forgot:" + clientIp(req),
                            Bandwidth.builder().capacity(3).refillGreedy(3, Duration.ofHours(1)).build());
            case "/api/auth/reset-password" ->
                    new LimitPolicy("reset:" + clientIp(req),
                            Bandwidth.builder().capacity(10).refillGreedy(10, Duration.ofMinutes(1)).build());
            default -> null;
        };
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        LimitPolicy policy = policyFor(request);
        if (policy == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Bucket bucket = resolveBucket(policy);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            response.setHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
            return;
        }

        long retryAfterSeconds = Math.max(1, probe.getNanosToWaitForRefill() / 1_000_000_000L);
        log.warn("Rate limit hit path={} ip={} retryAfter={}s", request.getRequestURI(), clientIp(request), retryAfterSeconds);
        response.setStatus(429);
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setContentType("application/json");
        response.getWriter().write(
                "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Too many requests, retry after "
                        + retryAfterSeconds + "s\"}");
    }

    private Bucket resolveBucket(LimitPolicy policy) {
        if (buckets.size() > MAX_TRACKED_KEYS) {
            buckets.clear();
        }
        return buckets.computeIfAbsent(policy.bucketKey(),
                k -> Bucket.builder().addLimit(policy.bandwidth()).build());
    }

    private String clientIp(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            int comma = forwarded.indexOf(',');
            return (comma > 0 ? forwarded.substring(0, comma) : forwarded).trim();
        }
        String realIp = req.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) return realIp.trim();
        return req.getRemoteAddr();
    }
}
