package com.ecartline.service;

import com.ecartline.config.JwtTokenProvider;
import com.ecartline.dto.AuthDtos.*;
import com.ecartline.entity.Order;
import com.ecartline.entity.User;
import com.ecartline.exception.ApiException;
import com.ecartline.repository.OrderRepository;
import com.ecartline.repository.ProductRepository;
import com.ecartline.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^[6-9]\\d{9}$");

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public static boolean isEmailValid(String email) {
        return email != null && EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    public static boolean isPhoneValid(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone.trim()).matches();
    }

    @Transactional
    public UserDto register(RegisterRequest req) {
        String name = req.getName() != null ? req.getName().trim() : "";
        String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
        String mobile = req.getMobile() != null ? req.getMobile().trim() : "";
        String password = req.getPassword() != null ? req.getPassword() : "";

        if (name.length() < 3) throw new ApiException(HttpStatus.BAD_REQUEST, "name", "Enter your full name");
        if (!isEmailValid(email)) throw new ApiException(HttpStatus.BAD_REQUEST, "email", "Enter a valid email address");
        if (!isPhoneValid(mobile)) throw new ApiException(HttpStatus.BAD_REQUEST, "mobile", "Enter a valid 10-digit mobile number");
        if (password.length() < 6) throw new ApiException(HttpStatus.BAD_REQUEST, "password", "Password must be at least 6 characters");

        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "email", "This email is already registered. Please login.");
        }
        if (userRepository.existsByMobile(mobile)) {
            throw new ApiException(HttpStatus.CONFLICT, "mobile", "This mobile number is already registered.");
        }

        String hashedPassword = passwordEncoder.encode(password);
        User user = new User(name, email, mobile, hashedPassword, "customer");
        user = userRepository.save(user);

        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getMobile(), user.getRole());
    }

    public AuthResponse login(LoginRequest req) {
        String id = req.getLoginIdentifier().toLowerCase();
        String password = req.getPassword();

        if (id.isEmpty() || password == null || password.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email/mobile and password are required");
        }

        Optional<User> userOpt = userRepository.findByEmail(id);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByMobile(id);
        }

        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email/mobile or password");
        }

        User user = userOpt.get();
        String token = tokenProvider.generateToken(user.getId(), user.getRole());
        UserDto userDto = new UserDto(user.getId(), user.getName(), user.getEmail(), user.getMobile(), user.getRole());

        return new AuthResponse(true, "Login successful", token, userDto);
    }

    public UserDto getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User no longer exists"));
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getMobile(), user.getRole());
    }

    @Transactional
    public UserDto updateProfile(Long userId, ProfileUpdateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        String name = req.getName() != null ? req.getName().trim() : "";
        String mobile = req.getMobile() != null ? req.getMobile().trim() : "";

        if (name.length() < 3) throw new ApiException(HttpStatus.BAD_REQUEST, "Full name must be at least 3 characters");
        if (!mobile.isEmpty() && !isPhoneValid(mobile)) throw new ApiException(HttpStatus.BAD_REQUEST, "Enter a valid 10-digit mobile number");

        if (!mobile.isEmpty()) {
            Optional<User> existing = userRepository.findByMobile(mobile);
            if (existing.isPresent() && !existing.get().getId().equals(userId)) {
                throw new ApiException(HttpStatus.CONFLICT, "This mobile number is already in use by another account");
            }
            user.setMobile(mobile);
        } else {
            user.setMobile(null);
        }

        user.setName(name);
        user = userRepository.save(user);

        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getMobile(), user.getRole());
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        String currentPassword = req.getCurrentPassword();
        String newPassword = req.getNewPassword();

        if (currentPassword == null || newPassword == null || currentPassword.isEmpty() || newPassword.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current and new password are required");
        }
        if (newPassword.length() < 6) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password must be at least 6 characters");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public AdminStatsDto getAdminStats() {
        AdminStatsDto stats = new AdminStatsDto();
        stats.setTotalCustomers(userRepository.countByRole("customer"));
        stats.setTotalProducts(productRepository.count());
        stats.setTotalOrders(orderRepository.count());
        stats.setTotalRevenue(orderRepository.sumTotalRevenue());
        stats.setOutOfStockCount(productRepository.countByStockLessThanEqual(0));
        stats.setLowStockCount(productRepository.countByStockGreaterThanAndStockLessThanEqual(0, 5));

        List<Object[]> statusRows = orderRepository.countByOrderStatusGroupBy();
        List<Map<String, Object>> statusBreakdown = new ArrayList<>();
        for (Object[] row : statusRows) {
            Map<String, Object> map = new HashMap<>();
            map.put("order_status", row[0]);
            map.put("count", row[1]);
            statusBreakdown.add(map);
        }
        stats.setStatusBreakdown(statusBreakdown);

        List<Order> recentOrdersList = orderRepository.findRecentOrders(PageRequest.of(0, 5));
        List<Map<String, Object>> recentOrders = new ArrayList<>();
        for (Order o : recentOrdersList) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", o.getId());
            map.put("order_number", o.getOrderNumber());
            map.put("total_amount", o.getTotalAmount());
            map.put("order_status", o.getOrderStatus());
            map.put("created_at", o.getCreatedAt());
            map.put("customer_name", o.getShippingName());
            recentOrders.add(map);
        }
        stats.setRecentOrders(recentOrders);

        return stats;
    }
}
