package com.talentgrid.backend.auth.oauth2;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames;

@Configuration
public class OAuth2ClientConfig {

    static final String LINKEDIN_REGISTRATION_ID = "linkedin";

    /**
     * LinkedIn's OpenID Connect implementation ignores the {@code nonce} request parameter and
     * omits the claim from its ID token. Spring would then reject the token with
     * {@code invalid_nonce}, so the nonce is stripped for LinkedIn only. The {@code state}
     * parameter still binds the callback to this browser session.
     */
    @Bean
    public OAuth2AuthorizationRequestResolver authorizationRequestResolver(ClientRegistrationRepository registrations) {
        var resolver = new DefaultOAuth2AuthorizationRequestResolver(
                registrations, OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI);

        resolver.setAuthorizationRequestCustomizer(builder -> {
            boolean[] linkedin = {false};
            builder.attributes(attrs ->
                    linkedin[0] = LINKEDIN_REGISTRATION_ID.equals(attrs.get(OAuth2ParameterNames.REGISTRATION_ID)));
            if (linkedin[0]) {
                builder.attributes(attrs -> attrs.remove(OidcParameterNames.NONCE));
                builder.additionalParameters(params -> params.remove(OidcParameterNames.NONCE));
            }
        });
        return resolver;
    }
}
