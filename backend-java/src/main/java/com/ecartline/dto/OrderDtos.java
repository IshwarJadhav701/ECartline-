package com.ecartline.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class OrderDtos {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DirectOrderItem {
        @JsonProperty("productId")
        @JsonAlias({"product_id", "productId"})
        private Long productId;

        private Integer quantity = 1;

        private BigDecimal price;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CreateOrderRequest {
        @JsonProperty("addressId")
        @JsonAlias({"address_id", "addressId"})
        private Long addressId;

        @JsonProperty("shippingName")
        @JsonAlias({"shipping_name", "shippingName", "fullName", "full_name"})
        private String shippingName;

        @JsonProperty("shippingPhone")
        @JsonAlias({"shipping_phone", "shippingPhone", "phone"})
        private String shippingPhone;

        private Object shippingAddress;

        @JsonProperty("paymentMethod")
        @JsonAlias({"payment_method", "paymentMethod"})
        private String paymentMethod = "cod";

        private List<DirectOrderItem> items;

        private BigDecimal subtotal;
        private BigDecimal deliveryFee;
        private BigDecimal totalAmount;

        public Long getAddressId() { return addressId; }
        public void setAddressId(Long addressId) { this.addressId = addressId; }

        public String getShippingName() { return shippingName; }
        public void setShippingName(String shippingName) { this.shippingName = shippingName; }

        public String getShippingPhone() { return shippingPhone; }
        public void setShippingPhone(String shippingPhone) { this.shippingPhone = shippingPhone; }

        public Object getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(Object shippingAddress) { this.shippingAddress = shippingAddress; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public List<DirectOrderItem> getItems() { return items; }
        public void setItems(List<DirectOrderItem> items) { this.items = items; }

        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

        public BigDecimal getDeliveryFee() { return deliveryFee; }
        public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }

        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

        public String getResolvedShippingAddress() {
            if (shippingAddress == null) return "";
            if (shippingAddress instanceof String) return ((String) shippingAddress).trim();
            if (shippingAddress instanceof Map) {
                Map<?, ?> m = (Map<?, ?>) shippingAddress;
                Object stObj = m.get("street");
                Object ctObj = m.get("city");
                Object staObj = m.get("state");
                Object pinObj = m.get("pincode");
                String st = stObj != null ? String.valueOf(stObj).trim() : "";
                String ct = ctObj != null ? String.valueOf(ctObj).trim() : "";
                String sta = staObj != null ? String.valueOf(staObj).trim() : "";
                String pin = pinObj != null ? String.valueOf(pinObj).trim() : "";
                List<String> parts = new ArrayList<>();
                for (String s : Arrays.asList(st, ct, sta, pin)) {
                    if (s != null && !s.isEmpty() && !"null".equalsIgnoreCase(s)) {
                        parts.add(s);
                    }
                }
                return String.join(", ", parts);
            }
            return String.valueOf(shippingAddress).trim();
        }

        public String getResolvedShippingName() {
            if (shippingName != null && !shippingName.trim().isEmpty()) return shippingName.trim();
            if (shippingAddress instanceof Map) {
                Map<?, ?> m = (Map<?, ?>) shippingAddress;
                Object n = m.get("fullName") != null ? m.get("fullName") : m.get("full_name");
                if (n != null && !String.valueOf(n).trim().isEmpty()) return String.valueOf(n).trim();
            }
            return "";
        }

        public String getResolvedShippingPhone() {
            if (shippingPhone != null && !shippingPhone.trim().isEmpty()) return shippingPhone.trim();
            if (shippingAddress instanceof Map) {
                Map<?, ?> m = (Map<?, ?>) shippingAddress;
                Object p = m.get("phone") != null ? m.get("phone") : m.get("mobile");
                if (p != null && !String.valueOf(p).trim().isEmpty()) return String.valueOf(p).trim();
            }
            return "";
        }
    }

    public static class UpdateOrderStatusRequest {
        private String orderStatus;

        public String getOrderStatus() { return orderStatus; }
        public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
    }

    public static class OrderItemDto {
        private Long id;

        @JsonProperty("product_id")
        private Long productId;

        @JsonProperty("product_name")
        private String productName;

        @JsonProperty("product_image")
        private String productImage;

        private Integer quantity;
        private BigDecimal price;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public String getProductImage() { return productImage; }
        public void setProductImage(String productImage) { this.productImage = productImage; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }

    public static class OrderDto {
        private Long id;

        @JsonProperty("order_number")
        private String orderNumber;

        @JsonProperty("user_id")
        private Long userId;

        @JsonProperty("total_amount")
        private BigDecimal totalAmount;

        private BigDecimal subtotal;

        @JsonProperty("delivery_fee")
        private BigDecimal deliveryFee;

        private BigDecimal discount;

        @JsonProperty("shipping_name")
        private String shippingName;

        @JsonProperty("shipping_phone")
        private String shippingPhone;

        @JsonProperty("shipping_address")
        private String shippingAddress;

        @JsonProperty("payment_method")
        private String paymentMethod;

        @JsonProperty("payment_status")
        private String paymentStatus;

        @JsonProperty("order_status")
        private String orderStatus;

        @JsonProperty("created_at")
        private LocalDateTime createdAt;

        @JsonProperty("customer_name")
        private String customerName;

        @JsonProperty("customer_email")
        private String customerEmail;

        @JsonProperty("total_items")
        private Integer totalItems;

        private List<OrderItemDto> items = new ArrayList<>();

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getOrderNumber() { return orderNumber; }
        public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

        public BigDecimal getDeliveryFee() { return deliveryFee; }
        public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }

        public BigDecimal getDiscount() { return discount; }
        public void setDiscount(BigDecimal discount) { this.discount = discount; }

        public String getShippingName() { return shippingName; }
        public void setShippingName(String shippingName) { this.shippingName = shippingName; }

        public String getShippingPhone() { return shippingPhone; }
        public void setShippingPhone(String shippingPhone) { this.shippingPhone = shippingPhone; }

        public String getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

        public String getOrderStatus() { return orderStatus; }
        public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }

        public String getCustomerEmail() { return customerEmail; }
        public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

        public Integer getTotalItems() { return totalItems; }
        public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }

        public List<OrderItemDto> getItems() { return items; }
        public void setItems(List<OrderItemDto> items) { this.items = items; }
    }
}
