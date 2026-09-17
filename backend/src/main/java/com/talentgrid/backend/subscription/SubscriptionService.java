package com.talentgrid.backend.subscription;

import com.talentgrid.backend.application.ApplicationRepository;
import com.talentgrid.backend.exception.ForbiddenException;
import com.talentgrid.backend.notification.NotificationService;
import com.talentgrid.backend.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;

/**
 * Plan state and the free-tier application quota.
 *
 * <p>There is no payment gateway yet: {@link #upgrade(User)} activates PRO immediately for
 * {@code app.subscription.pro-days} days. Swap that method's body for a Razorpay / Stripe
 * checkout + webhook when billing is ready; nothing else needs to change.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionRepository repository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;

    @Value("${app.subscription.free-applications-per-month:3}")
    private int freeApplicationsPerMonth;

    @Value("${app.subscription.pro-days:30}")
    private int proDays;

    @Transactional
    public SubscriptionResponse me(User user) {
        return toResponse(user, getOrCreate(user));
    }

    @Transactional
    public SubscriptionResponse upgrade(User user) {
        Subscription sub = getOrCreate(user);
        Instant base = sub.isProActive() ? sub.getExpiresAt() : Instant.now();
        sub.setPlan(SubscriptionPlan.PRO);
        sub.setExpiresAt(base.plus(proDays, ChronoUnit.DAYS));
        log.info("Subscription upgraded to PRO userId={} until={}", user.getId(), sub.getExpiresAt());
        notificationService.subscriptionChanged(user, "Welcome to PRO. Unlimited applications are now active.");
        return toResponse(user, sub);
    }

    @Transactional
    public SubscriptionResponse cancel(User user) {
        Subscription sub = getOrCreate(user);
        sub.setPlan(SubscriptionPlan.FREE);
        sub.setExpiresAt(null);
        log.info("Subscription cancelled userId={}", user.getId());
        notificationService.subscriptionChanged(user, "Your PRO plan has been cancelled. You are on the Free plan.");
        return toResponse(user, sub);
    }

    /** Throws when a free-plan user has used up this month's applications. */
    @Transactional(readOnly = true)
    public void assertCanApply(User user) {
        Subscription sub = repository.findByUserId(user.getId()).orElse(null);
        if (sub != null && sub.isProActive()) return;
        long used = applicationsThisMonth(user);
        if (used >= freeApplicationsPerMonth) {
            throw new ForbiddenException("The Free plan allows " + freeApplicationsPerMonth
                    + " applications per month. Upgrade to PRO for unlimited applications.");
        }
    }

    private Subscription getOrCreate(User user) {
        return repository.findByUserId(user.getId())
                .orElseGet(() -> repository.save(Subscription.builder().user(user).build()));
    }

    private long applicationsThisMonth(User user) {
        Instant monthStart = LocalDate.now(ZoneOffset.UTC).withDayOfMonth(1)
                .atStartOfDay(ZoneOffset.UTC).toInstant();
        return applicationRepository.countByUserIdAndAppliedAtGreaterThanEqual(user.getId(), monthStart);
    }

    private SubscriptionResponse toResponse(User user, Subscription sub) {
        boolean active = sub.isProActive();
        return new SubscriptionResponse(
                active ? SubscriptionPlan.PRO : SubscriptionPlan.FREE,
                active,
                active ? sub.getExpiresAt() : null,
                applicationsThisMonth(user),
                active ? null : freeApplicationsPerMonth);
    }
}
