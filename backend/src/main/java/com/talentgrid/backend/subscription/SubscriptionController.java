package com.talentgrid.backend.subscription;

import com.talentgrid.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/me")
    public ResponseEntity<SubscriptionResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(subscriptionService.me(principal.user()));
    }

    /** Simulated checkout: activates PRO immediately. Replace with a payment-gateway flow. */
    @PostMapping("/upgrade")
    public ResponseEntity<SubscriptionResponse> upgrade(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(subscriptionService.upgrade(principal.user()));
    }

    @PostMapping("/cancel")
    public ResponseEntity<SubscriptionResponse> cancel(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(subscriptionService.cancel(principal.user()));
    }
}
