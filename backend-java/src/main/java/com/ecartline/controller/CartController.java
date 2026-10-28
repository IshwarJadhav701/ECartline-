package com.ecartline.controller;

import com.ecartline.config.UserPrincipal;
import com.ecartline.dto.CartDtos.*;
import com.ecartline.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        CartResponse cart = cartService.loadCart(principal.getId());
        return ResponseEntity.ok(Map.of("success", true, "data", cart));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody AddToCartRequest req) {
        CartResponse cart = cartService.addToCart(principal.getId(), req.getProductId(), req.getQuantity());
        return ResponseEntity.ok(Map.of("success", true, "message", "Product added to cart", "data", cart));
    }

    @PostMapping("/merge")
    public ResponseEntity<Map<String, Object>> mergeCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody MergeCartRequest req) {
        CartResponse cart = cartService.mergeCart(principal.getId(), req.getItems());
        return ResponseEntity.ok(Map.of("success", true, "data", cart));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<Map<String, Object>> updateQuantity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @RequestBody UpdateCartRequest req) {
        CartResponse cart = cartService.updateQuantity(principal.getId(), productId, req.getQuantity());
        return ResponseEntity.ok(Map.of("success", true, "data", cart));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Map<String, Object>> removeFromCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        CartResponse cart = cartService.removeFromCart(principal.getId(), productId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Product removed", "data", cart));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        CartResponse cart = cartService.clearCart(principal.getId());
        return ResponseEntity.ok(Map.of("success", true, "message", "Cart cleared", "data", cart));
    }
}
