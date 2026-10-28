package com.ecartline.service;

import com.ecartline.dto.ProductDto;
import com.ecartline.entity.Product;
import com.ecartline.entity.WishlistItem;
import com.ecartline.repository.ProductRepository;
import com.ecartline.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;

    public WishlistService(WishlistItemRepository wishlistItemRepository, ProductRepository productRepository) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.productRepository = productRepository;
    }

    public Map<String, Object> getWishlist(Long userId) {
        List<WishlistItem> rows = wishlistItemRepository.findByUserIdOrderByIdDesc(userId);
        List<Long> ids = new ArrayList<>();
        List<ProductDto> products = new ArrayList<>();

        for (WishlistItem w : rows) {
            ids.add(w.getProductId());
            Product p = productRepository.findById(w.getProductId()).orElse(null);
            if (p != null) {
                products.add(ProductDto.fromEntity(p));
            }
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("ids", ids);
        res.put("data", products);
        return res;
    }

    @Transactional
    public List<Long> addToWishlist(Long userId, Long productId) {
        if (!wishlistItemRepository.existsByUserIdAndProductId(userId, productId)) {
            WishlistItem item = new WishlistItem(userId, productId);
            wishlistItemRepository.save(item);
        }
        return getWishlistIds(userId);
    }

    @Transactional
    public List<Long> removeFromWishlist(Long userId, Long productId) {
        wishlistItemRepository.deleteByUserIdAndProductId(userId, productId);
        return getWishlistIds(userId);
    }

    @Transactional
    public List<Long> syncWishlist(Long userId, List<Long> productIds) {
        if (productIds != null) {
            for (Long pid : productIds) {
                if (pid != null && !wishlistItemRepository.existsByUserIdAndProductId(userId, pid)) {
                    wishlistItemRepository.save(new WishlistItem(userId, pid));
                }
            }
        }
        return getWishlistIds(userId);
    }

    private List<Long> getWishlistIds(Long userId) {
        return wishlistItemRepository.findByUserIdOrderByIdDesc(userId).stream()
                .map(WishlistItem::getProductId)
                .toList();
    }
}
