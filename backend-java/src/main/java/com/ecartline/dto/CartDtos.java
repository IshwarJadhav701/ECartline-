package com.ecartline.dto;

import java.util.ArrayList;
import java.util.List;

public class CartDtos {

    public static class AddToCartRequest {
        private Long productId;
        private Integer quantity = 1;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class UpdateCartRequest {
        private Integer quantity;

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class MergeCartRequest {
        private List<AddToCartRequest> items = new ArrayList<>();

        public List<AddToCartRequest> getItems() { return items; }
        public void setItems(List<AddToCartRequest> items) { this.items = items; }
    }

    public static class CartItemDto {
        private Long productId;
        private Integer quantity;
        private ProductDto product;

        public CartItemDto() {}
        public CartItemDto(Long productId, Integer quantity, ProductDto product) {
            this.productId = productId;
            this.quantity = quantity;
            this.product = product;
        }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public ProductDto getProduct() { return product; }
        public void setProduct(ProductDto product) { this.product = product; }
    }

    public static class CartResponse {
        private List<CartItemDto> items = new ArrayList<>();
        private int totalItems = 0;

        public CartResponse() {}
        public CartResponse(List<CartItemDto> items, int totalItems) {
            this.items = items;
            this.totalItems = totalItems;
        }

        public List<CartItemDto> getItems() { return items; }
        public void setItems(List<CartItemDto> items) { this.items = items; }

        public int getTotalItems() { return totalItems; }
        public void setTotalItems(int totalItems) { this.totalItems = totalItems; }
    }
}
