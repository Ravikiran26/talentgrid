package com.talentgrid.backend.auth.oauth2;

import com.talentgrid.backend.auth.AuthService;
import com.talentgrid.backend.user.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Completes a social sign-in by issuing the same JWT as password login and handing it to the
 * frontend. The token travels in the URL <em>fragment</em> so it is never sent to a server,
 * written to access logs, or leaked through the Referer header.
 */
@Component
@Slf4j
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final OAuth2AccountService accountService;
    private final AuthService authService;
    private final String frontendCallbackUrl;

    public OAuth2LoginSuccessHandler(OAuth2AccountService accountService,
                                     AuthService authService,
                                     @Value("${app.oauth2.frontend-callback-url}") String frontendCallbackUrl) {
        this.accountService = accountService;
        this.authService = authService;
        this.frontendCallbackUrl = frontendCallbackUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        String registrationId = token.getAuthorizedClientRegistrationId();

        // The HTTP session only existed to carry the authorization request across the
        // provider round-trip; the API is stateless from here on.
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();

        String fragment;
        try {
            User user = accountService.findOrCreate(registrationId, token.getPrincipal());
            String jwt = authService.authResponseFor(user).token();
            fragment = "token=" + URLEncoder.encode(jwt, StandardCharsets.UTF_8);
        } catch (OAuth2AccountException e) {
            log.warn("Social sign-in rejected provider={} code={}: {}", registrationId, e.code(), e.getMessage());
            fragment = "error=" + e.code();
        }

        response.sendRedirect(frontendCallbackUrl + "#" + fragment);
    }
}
