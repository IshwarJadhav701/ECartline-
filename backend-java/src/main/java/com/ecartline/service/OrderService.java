package com.ecartline.service;

import com.ecartline.dto.OrderDtos.*;
import com.ecartline.entity.*;
import com.ecartline.exception.ApiException;
import com.ecartline.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final CartItemRepository cartItemRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            AddressRepository addressRepository,
            CartItemRepository cartItemRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.addressRepository = addressRepository;
        this.cartItemRepository = cartItemRepository;
    }

    private OrderDto mapToDto(Order o) {
        if (o == null) return null;
        OrderDto dto = new OrderDto();
        dto.setId(o.getId());
        dto.setOrderNumber(o.getOrderNumber());
        dto.setUserId(o.getUserId());
        dto.setTotalAmount(o.getTotalAmount());
        dto.setSubtotal(o.getSubtotal());
        dto.setDeliveryFee(o.getDeliveryFee());
        dto.setDiscount(o.getDiscount());
        dto.setShippingName(o.getShippingName());
        dto.setShippingPhone(o.getShippingPhone());
        dto.setShippingAddress(o.getShippingAddress());
        dto.setPaymentMethod(o.getPaymentMethod());
        dto.setPaymentStatus(o.getPaymentStatus());
        dto.setOrderStatus(o.getOrderStatus());
        dto.setCreatedAt(o.getCreatedAt());

        if (o.getUser() != null) {
            dto.setCustomerName(o.getUser().getName());
            dto.setCustomerEmail(o.getUser().getEmail());
        }

        List<OrderItem> items = orderItemRepository.findByOrderIdOrderByIdAsc(o.getId());
        List<OrderItemDto> itemDtos = new ArrayList<>();
        int totalQty = 0;
        for (OrderItem it : items) {
            OrderItemDto idto = new OrderItemDto();
            idto.setId(it.getId());
            idto.setProductId(it.getProductId());
            idto.setProductName(it.getProductName());
            idto.setProductImage(it.getProductImage());
            idto.setQuantity(it.getQuantity());
            idto.setPrice(it.getPrice());
            itemDtos.add(idto);
            totalQty += it.getQuantity();
        }
        dto.setItems(itemDtos);
        dto.setTotalItems(totalQty);
        return dto;
    }

    @Transactional
    public OrderDto createOrder(Long userId, CreateOrderRequest req) {
        String shippingName = req.getShippingName() != null ? req.getShippingName().trim() : "";
        String shippingPhone = req.getShippingPhone() != null ? req.getShippingPhone().trim() : "";
        String shippingAddress = req.getShippingAddress() != null ? req.getShippingAddress().trim() : "";

        if (req.getAddressId() != null) {
            Optional<Address> addrOpt = addressRepository.findByIdAndUserId(req.getAddressId(), userId);
            if (addrOpt.isPresent()) {
                Address a = addrOpt.get();
                shippingName = a.getFullName();
                shippingPhone = a.getPhone();
                shippingAddress = a.getStreet() + ", " + a.getCity() + ", " + a.getState() + " - " + a.getPincode();
            }
        }

        if (shippingName.length() < 2) throw new ApiException(HttpStatus.BAD_REQUEST, "Valid delivery recipient name is required");
        if (shippingPhone.length() < 10) throw new ApiException(HttpStatus.BAD_REQUEST, "Valid delivery phone number is required");
        if (shippingAddress.length() < 8) throw new ApiException(HttpStatus.BAD_REQUEST, "Full delivery address is required");

        String method = req.getPaymentMethod() != null ? req.getPaymentMethod().toLowerCase() : "cod";
        if (!Arrays.asList("cod", "upi", "card").contains(method)) {
            method = "cod";
        }

        List<DirectOrderItem> itemsToProcess = new ArrayList<>();
        boolean fromCart = false;

        if (req.getItems() != null && !req.getItems().isEmpty()) {
            itemsToProcess = req.getItems();
        } else {
            List<CartItem> cartRows = cartItemRepository.findByUserIdOrderByIdAsc(userId);
            if (cartRows.isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Your cart is empty. Add items before checking out.");
            }
            fromCart = true;
            for (CartItem ci : cartRows) {
                DirectOrderItem doi = new DirectOrderItem();
                doi.setProductId(ci.getProductId());
                doi.setQuantity(ci.getQuantity());
                itemsToProcess.add(doi);
            }
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItemsToSave = new ArrayList<>();

        for (DirectOrderItem item : itemsToProcess) {
            Product p = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product #" + item.getProductId() + " not found"));

            int qty = (item.getQuantity() != null && item.getQuantity() >= 1) ? item.getQuantity() : 1;
            if (p.getStock() < qty) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient stock for \"" + p.getName() + "\". Only " + p.getStock() + " left in stock.");
            }

            // Decrement stock
            p.setStock(p.getStock() - qty);
            productRepository.save(p);

            BigDecimal lineTotal = p.getPrice().multiply(new BigDecimal(qty));
            subtotal = subtotal.add(lineTotal);

            OrderItem oi = new OrderItem();
            oi.setProductId(p.getId());
            oi.setProductName(p.getName());
            oi.setProductImage(p.getImage());
            oi.setQuantity(qty);
            oi.setPrice(p.getPrice());
            orderItemsToSave.add(oi);
        }

        BigDecimal deliveryFee = subtotal.compareTo(new BigDecimal(499)) >= 0 ? BigDecimal.ZERO : new BigDecimal(49);
        BigDecimal totalAmount = subtotal.add(deliveryFee);

        String orderNumber = "ORD-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 900 + 100);

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUserId(userId);
        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setDiscount(BigDecimal.ZERO);
        order.setTotalAmount(totalAmount);
        order.setShippingName(shippingName);
        order.setShippingPhone(shippingPhone);
        order.setShippingAddress(shippingAddress);
        order.setPaymentMethod(method);
        order.setPaymentStatus("pending");
        order.setOrderStatus("placed");
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        order = orderRepository.save(order);

        for (OrderItem oi : orderItemsToSave) {
            oi.setOrderId(order.getId());
            orderItemRepository.save(oi);
        }

        if (fromCart) {
            cartItemRepository.deleteByUserId(userId);
        }

        return mapToDto(order);
    }

    public List<OrderDto> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .toList();
    }

    public OrderDto getOrderById(Long orderId, Long userId) {
        Order o = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        return mapToDto(o);
    }

    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        Order o = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!Arrays.asList("placed", "processing").contains(o.getOrderStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This order cannot be cancelled as it is already " + o.getOrderStatus());
        }

        o.setOrderStatus("cancelled");
        o.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(o);

        // Restore product stock
        List<OrderItem> items = orderItemRepository.findByOrderIdOrderByIdAsc(orderId);
        for (OrderItem it : items) {
            productRepository.findById(it.getProductId()).ifPresent(p -> {
                p.setStock(p.getStock() + it.getQuantity());
                productRepository.save(p);
            });
        }
    }

    public List<OrderDto> getAllOrdersAdmin() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public void updateOrderStatusAdmin(Long orderId, String newStatus) {
        Order o = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));

        if (newStatus == null || !Arrays.asList("placed", "processing", "shipped", "delivered", "cancelled").contains(newStatus.toLowerCase())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid order status");
        }

        String st = newStatus.toLowerCase();
        // If transitioning to cancelled, restore stock
        if ("cancelled".equals(st) && !"cancelled".equals(o.getOrderStatus())) {
            List<OrderItem> items = orderItemRepository.findByOrderIdOrderByIdAsc(orderId);
            for (OrderItem it : items) {
                productRepository.findById(it.getProductId()).ifPresent(p -> {
                    p.setStock(p.getStock() + it.getQuantity());
                    productRepository.save(p);
                });
            }
        }

        o.setOrderStatus(st);
        o.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(o);
    }
}
