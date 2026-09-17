package com.talentgrid.backend.config;

import com.talentgrid.backend.auth.oauth2.OAuth2LoginFailureHandler;
import com.talentgrid.backend.exception.ApiErrorWriter;
import com.talentgrid.backend.auth.oauth2.OAuth2LoginSuccessHandler;
import com.talentgrid.backend.security.AppUserDetailsService;
import com.talentgrid.backend.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpStatus;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AppUserDetailsService userDetailsService;
    private final OAuth2AuthorizationRequestResolver authorizationRequestResolver;
    private final OAuth2LoginSuccessHandler oauth2SuccessHandler;
    private final OAuth2LoginFailureHandler oauth2FailureHandler;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers
                        .frameOptions(frame -> frame.deny())
                        .contentTypeOptions(Customizer.withDefaults())
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31_536_000))
                        .referrerPolicy(rp -> rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                        .permissionsPolicyHeader(pp -> pp.policy(
                                "geolocation=(), microphone=(), camera=(), payment=(), usb=()"))
                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                "default-src 'none'; frame-ancestors 'none'"))
                )
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/jobs").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/jobs/stats", "/api/jobs/facets").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/insights/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/companies/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/jobs/*").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/employer/**").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.POST, "/api/jobs").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/jobs/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/applications").hasRole("CANDIDATE")
                        .requestMatchers(HttpMethod.GET, "/api/applications/my").hasRole("CANDIDATE")
                        .requestMatchers("/api/profile/**").hasRole("CANDIDATE")
                        .requestMatchers("/api/saved-jobs/**").hasRole("CANDIDATE")
                        .requestMatchers("/api/subscription/**").hasRole("CANDIDATE")
                        .anyRequest().authenticated()
                )
                // Security rejects requests before controller advice runs, so both responses
                // are written in the same JSON shape the rest of the API uses.
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> ApiErrorWriter.write(
                                res, HttpStatus.UNAUTHORIZED,
                                "Authentication required. Sign in and send a bearer token."))
                        .accessDeniedHandler((req, res, e) -> ApiErrorWriter.write(
                                res, HttpStatus.FORBIDDEN,
                                "You do not have permission to perform this action."))
                )
                // Social sign-in (Google / LinkedIn). The authorization request is parked in a
                // short-lived HTTP session for the provider round-trip only; the success handler
                // invalidates it and hands a JWT to the frontend.
                .oauth2Login(oauth -> oauth
                        .authorizationEndpoint(ae -> ae.authorizationRequestResolver(authorizationRequestResolver))
                        .successHandler(oauth2SuccessHandler)
                        .failureHandler(oauth2FailureHandler))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList());
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(List.of("Authorization", "X-Total-Count", "X-Total-Pages", "X-Request-Id"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
