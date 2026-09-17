package com.talentgrid.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/** Enables {@code @Async} for fire-and-forget work such as e-mail delivery. */
@Configuration
@EnableAsync
public class AsyncConfig {
}
