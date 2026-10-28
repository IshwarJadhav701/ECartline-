package com.ecartline.controller;

import com.ecartline.config.UserPrincipal;
import com.ecartline.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWishlist(@AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> res = wishlistService.getWishlist(principal.getId());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Map<String, Object>> addToWishlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        List<Long> ids = wishlistService.addToWishlist(principal.getId(), productId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Added to wishlist", "ids", ids));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Map<String, Object>> removeFromWishlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        List<Long> ids = wishlistService.removeFromWishlist(principal.getId(), productId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Removed from wishlist", "ids", ids));
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncWishlist(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, List<Long>> body) {
        List<Long> productIds = body.get("productIds");
        List<Long> ids = wishlistService.syncWishlist(principal.getId(), productIds);
        return ResponseEntity.ok(Map.of("success", true, "ids", ids));
    }
}
