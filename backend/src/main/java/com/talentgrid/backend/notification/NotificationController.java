package com.talentgrid.backend.notification;

import com.talentgrid.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<NotificationService.Feed> feed(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(notificationService.feed(principal.user()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(@AuthenticationPrincipal UserPrincipal principal,
                                                         @PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(principal.user(), id));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllRead(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("updated", notificationService.markAllRead(principal.user())));
    }
}
