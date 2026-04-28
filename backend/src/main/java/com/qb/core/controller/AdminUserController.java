package com.qb.core.controller;

import com.qb.core.dto.ApiResponse;
import com.qb.core.dto.UserProfileDTO;
import com.qb.core.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserProfileDTO>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.getAllUsers()));
    }

    @PutMapping("/{id}/toggle-admin")
    public ResponseEntity<ApiResponse<UserProfileDTO>> toggleAdmin(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.toggleAdmin(id)));
    }

    @PutMapping("/sessions/{sessionId}/link-candidate")
    public ResponseEntity<ApiResponse<Void>> linkCandidate(
            @PathVariable UUID sessionId,
            @RequestBody Map<String, String> body) {
        String candidateIdStr = body.get("candidateId");
        UUID candidateId = candidateIdStr != null && !candidateIdStr.isBlank()
                ? UUID.fromString(candidateIdStr) : null;
        adminUserService.linkCandidate(sessionId, candidateId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Session linked to candidate"));
    }
}
