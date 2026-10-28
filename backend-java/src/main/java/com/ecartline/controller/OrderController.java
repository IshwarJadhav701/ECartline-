package com.ecartline.controller;

import com.ecartline.config.UserPrincipal;
import com.ecartline.dto.ApiResponse;
import com.ecartline.dto.OrderDtos.*;
import com.ecartline.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CreateOrderRequest req) {
        OrderDto order = orderService.createOrder(principal.getId(), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Order placed successfully",
                "order", order
        ));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserOrders(@AuthenticationPrincipal UserPrincipal principal) {
        List<OrderDto> orders = orderService.getUserOrders(principal.getId());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", orders.size(),
                "data", orders
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOrderById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        OrderDto order = orderService.getOrderById(id, principal.getId());
        return ResponseEntity.ok(Map.of("success", true, "data", order));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse> cancelOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        orderService.cancelOrder(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled successfully"));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<Map<String, Object>> getAllOrdersAdmin() {
        List<OrderDto> orders = orderService.getAllOrdersAdmin();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", orders.size(),
                "data", orders
        ));
    }

    @PutMapping("/admin/{id}/status")
    public ResponseEntity<ApiResponse> updateOrderStatusAdmin(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest req) {
        orderService.updateOrderStatusAdmin(id, req.getOrderStatus());
        return ResponseEntity.ok(ApiResponse.ok("Order status updated successfully"));
    }
}
