package com.qb.core.controller;

import com.qb.auth.model.AuthenticatedUser;
import com.qb.core.dto.ApiResponse;
import com.qb.core.dto.UserDashboardStatsDTO;
import com.qb.core.dto.UserProfileDTO;
import com.qb.core.dto.UserSessionDetailsDTO;
import com.qb.core.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ── Profile ──────────────────────────────────────────────────────

    @GetMapping("/api/users/me")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getMe(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.getProfile(UUID.fromString(user.id()))
        ));
    }

    @PutMapping("/api/users/me")
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateMe(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.updateProfile(
                        UUID.fromString(user.id()),
                        body.get("name"),
                        body.get("phone")
                )
        ));
    }

    // ── User Dashboard ───────────────────────────────────────────────

    @GetMapping("/api/user/dashboard/stats")
    public ResponseEntity<ApiResponse<UserDashboardStatsDTO>> getDashboardStats(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.getDashboardStats(UUID.fromString(user.id()))
        ));
    }

    @GetMapping("/api/users/me/sessions")
    public ResponseEntity<ApiResponse<List<UserSessionDetailsDTO>>> getMySessions(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.getMySessions(UUID.fromString(user.id()))
        ));
    }
}
