package com.ecartline.service;

import com.ecartline.dto.CartDtos.*;
import com.ecartline.dto.ProductDto;
import com.ecartline.entity.CartItem;
import com.ecartline.entity.Product;
import com.ecartline.exception.ApiException;
import com.ecartline.repository.CartItemRepository;
import com.ecartline.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private static final int MAX_QTY_PER_PRODUCT = 10;

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    public CartResponse loadCart(Long userId) {
        List<CartItem> rows = cartItemRepository.findByUserIdOrderByIdAsc(userId);
        List<CartItemDto> items = new ArrayList<>();
        int totalItems = 0;

        for (CartItem ci : rows) {
            Product p = productRepository.findById(ci.getProductId()).orElse(null);
            if (p != null) {
                items.add(new CartItemDto(ci.getProductId(), ci.getQuantity(), ProductDto.fromEntity(p)));
                totalItems += ci.getQuantity();
            }
        }
        return new CartResponse(items, totalItems);
    }

    @Transactional
    public CartResponse addToCart(Long userId, Long productId, Integer quantity) {
        int qty = (quantity != null && quantity >= 1) ? quantity : 1;
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        int max = Math.min(MAX_QTY_PER_PRODUCT, p.getStock() != null ? p.getStock() : 0);
        if (max < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This product is out of stock");
        }

        Optional<CartItem> existing = cartItemRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQty = Math.min(item.getQuantity() + qty, max);
            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem(userId, productId, Math.min(qty, max));
            cartItemRepository.save(item);
        }

        return loadCart(userId);
    }

    @Transactional
    public CartResponse updateQuantity(Long userId, Long productId, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A valid quantity is required");
        }

        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        if (p.getStock() == null || p.getStock() <= 0) {
            cartItemRepository.deleteByUserIdAndProductId(userId, productId);
            throw new ApiException(HttpStatus.BAD_REQUEST, "This product is currently out of stock and was removed from your cart");
        }

        int max = Math.min(MAX_QTY_PER_PRODUCT, p.getStock());
        int targetQty = Math.max(1, Math.min(quantity, max));

        CartItem item = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product is not in your cart"));

        item.setQuantity(targetQty);
        cartItemRepository.save(item);

        return loadCart(userId);
    }

    @Transactional
    public CartResponse mergeCart(Long userId, List<AddToCartRequest> items) {
        if (items != null) {
            for (AddToCartRequest req : items) {
                if (req.getProductId() != null) {
                    try {
                        addToCart(userId, req.getProductId(), req.getQuantity());
                    } catch (Exception ignored) {}
                }
            }
        }
        return loadCart(userId);
    }

    @Transactional
    public CartResponse removeFromCart(Long userId, Long productId) {
        cartItemRepository.deleteByUserIdAndProductId(userId, productId);
        return loadCart(userId);
    }

    @Transactional
    public CartResponse clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
        return loadCart(userId);
    }
}
