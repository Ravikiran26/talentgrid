package com.talentgrid.backend.auth.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/** Sends provider-side failures (user cancelled, bad client config, invalid state) back to the frontend. */
@Component
@Slf4j
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private final String frontendCallbackUrl;

    public OAuth2LoginFailureHandler(@Value("${app.oauth2.frontend-callback-url}") String frontendCallbackUrl) {
        this.frontendCallbackUrl = frontendCallbackUrl;
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        log.warn("Social sign-in failed: {}", exception.getMessage());
        response.sendRedirect(frontendCallbackUrl + "#error=oauth_failed");
    }
}
