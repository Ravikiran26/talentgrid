package com.talentgrid.backend.subscription;

import java.time.Instant;

public record SubscriptionResponse(
        SubscriptionPlan plan,
        boolean active,
        Instant renewsOn,
        long applicationsThisMonth,
        Integer applicationLimit   // null = unlimited
) {}
