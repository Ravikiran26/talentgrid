package com.talentgrid.backend.account;

import com.talentgrid.backend.auth.dto.AuthResponse;
import com.talentgrid.backend.auth.dto.MessageResponse;
import com.talentgrid.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Self-service account settings for any signed-in user. */
@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(@AuthenticationPrincipal UserPrincipal principal,
                                                          @Valid @RequestBody AccountRequests.ChangePassword req) {
        accountService.changePassword(principal.user(), req);
        return ResponseEntity.ok(new MessageResponse("Password updated"));
    }

    @PostMapping("/change-email")
    public ResponseEntity<AuthResponse> changeEmail(@AuthenticationPrincipal UserPrincipal principal,
                                                    @Valid @RequestBody AccountRequests.ChangeEmail req) {
        return ResponseEntity.ok(accountService.changeEmail(principal.user(), req));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal UserPrincipal principal,
                                              @RequestBody(required = false) AccountRequests.DeleteAccount req) {
        accountService.deleteAccount(principal.user(), req);
        return ResponseEntity.noContent().build();
    }
}
