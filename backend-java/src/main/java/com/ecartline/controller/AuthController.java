package com.ecartline.controller;

import com.ecartline.config.UserPrincipal;
import com.ecartline.dto.ApiResponse;
import com.ecartline.dto.AuthDtos.*;
import com.ecartline.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest req) {
        UserDto user = authService.register(req);
        ApiResponse res = new ApiResponse(true, "Account created", user);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        AuthResponse res = authService.login(req);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        UserDto user = authService.getMe(principal.getId());
        return ResponseEntity.ok(Map.of("success", true, "user", user));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ProfileUpdateRequest req) {
        UserDto user = authService.updateProfile(principal.getId(), req);
        return ResponseEntity.ok(Map.of("success", true, "message", "Profile updated successfully", "user", user));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ChangePasswordRequest req) {
        authService.changePassword(principal.getId(), req);
        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully"));
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        AdminStatsDto stats = authService.getAdminStats();
        return ResponseEntity.ok(Map.of("success", true, "data", stats));
    }
}
