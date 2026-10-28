package com.ecartline.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AuthDtos {

    public static class LoginRequest {
        private String id;
        private String email;
        private String password;

        public String getLoginIdentifier() {
            if (id != null && !id.trim().isEmpty()) return id.trim();
            if (email != null && !email.trim().isEmpty()) return email.trim();
            return "";
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String name;
        private String email;
        private String mobile;
        private String password;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class ProfileUpdateRequest {
        private String name;
        private String mobile;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }
    }

    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String mobile;
        private String role;

        public UserDto() {}
        public UserDto(Long id, String name, String email, String mobile, String role) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.mobile = mobile;
            this.role = role;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AuthResponse {
        private boolean success;
        private String message;
        private String token;
        private UserDto user;

        public AuthResponse() {}
        public AuthResponse(boolean success, String message, String token, UserDto user) {
            this.success = success;
            this.message = message;
            this.token = token;
            this.user = user;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public UserDto getUser() { return user; }
        public void setUser(UserDto user) { this.user = user; }
    }

    public static class AdminStatsDto {
        private long totalCustomers;
        private long totalProducts;
        private long totalOrders;
        private BigDecimal totalRevenue;
        private long outOfStockCount;
        private long lowStockCount;
        private List<Map<String, Object>> statusBreakdown;
        private List<Map<String, Object>> recentOrders;

        public long getTotalCustomers() { return totalCustomers; }
        public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

        public long getTotalProducts() { return totalProducts; }
        public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

        public long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

        public long getOutOfStockCount() { return outOfStockCount; }
        public void setOutOfStockCount(long outOfStockCount) { this.outOfStockCount = outOfStockCount; }

        public long getLowStockCount() { return lowStockCount; }
        public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }

        public List<Map<String, Object>> getStatusBreakdown() { return statusBreakdown; }
        public void setStatusBreakdown(List<Map<String, Object>> statusBreakdown) { this.statusBreakdown = statusBreakdown; }

        public List<Map<String, Object>> getRecentOrders() { return recentOrders; }
        public void setRecentOrders(List<Map<String, Object>> recentOrders) { this.recentOrders = recentOrders; }
    }
}
