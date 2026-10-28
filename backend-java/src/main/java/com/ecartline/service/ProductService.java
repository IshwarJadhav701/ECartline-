package com.ecartline.service;

import com.ecartline.dto.ProductDto;
import com.ecartline.entity.Product;
import com.ecartline.exception.ApiException;
import com.ecartline.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ProductService {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Map<String, Object> getProducts(
            String category,
            String query,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating,
            Integer minDiscount,
            Boolean inStock,
            String sort,
            int page,
            int limit) {

        int safePage = Math.max(page, 1);
        int safeLimit = Math.min(Math.max(limit, 1), 500);

        Sort sorting = switch (sort != null ? sort : "featured") {
            case "newest" -> Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
            case "price_asc" -> Sort.by(Sort.Order.asc("price"));
            case "price_desc" -> Sort.by(Sort.Order.desc("price"));
            case "rating" -> Sort.by(Sort.Order.desc("rating"));
            default -> Sort.by(Sort.Order.asc("id"));
        };

        Pageable pageable = PageRequest.of(safePage - 1, safeLimit, sorting);
        boolean inStockOnly = Boolean.TRUE.equals(inStock);

        String catParam = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All")) ? category.trim() : null;
        String queryParam = (query != null && !query.trim().isEmpty()) ? query.trim() : null;

        Page<Product> paged = productRepository.findFiltered(catParam, queryParam, minPrice, maxPrice, minRating, inStockOnly, pageable);

        List<ProductDto> list = paged.getContent().stream()
                .map(ProductDto::fromEntity)
                .filter(p -> {
                    if (minDiscount != null && minDiscount > 0) {
                        return p.getPct() != null && p.getPct() >= minDiscount;
                    }
                    return true;
                })
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("count", list.size());
        result.put("total", paged.getTotalElements());
        result.put("page", safePage);
        result.put("limit", safeLimit);
        result.put("data", list);

        return result;
    }

    public List<ProductDto> getSuggestions(String q) {
        if (q == null || q.trim().length() < 2) {
            return Collections.emptyList();
        }
        Pageable pageable = PageRequest.of(0, 6);
        return productRepository.findSuggestions(q.trim(), pageable).stream()
                .map(ProductDto::fromEntity)
                .toList();
    }

    public ProductDto getProductById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        return ProductDto.fromEntity(p);
    }

    @Transactional
    public ProductDto createProduct(Map<String, Object> body) {
        String name = (String) body.get("name");
        String category = (String) body.get("category");
        Object priceObj = body.get("price");

        if (name == null || name.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "name is required");
        }
        if (category == null || category.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "category is required");
        }
        if (priceObj == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "price is required");
        }

        Product p = new Product();
        p.setName(name.trim());
        p.setCategory(category.trim());
        p.setPrice(new BigDecimal(String.valueOf(priceObj)));

        if (body.get("oldPrice") != null && !String.valueOf(body.get("oldPrice")).trim().isEmpty()) {
            p.setOldPrice(new BigDecimal(String.valueOf(body.get("oldPrice"))));
        }
        if (body.get("stock") != null) {
            p.setStock(Integer.parseInt(String.valueOf(body.get("stock"))));
        } else {
            p.setStock(25);
        }
        if (body.get("image") != null) {
            p.setImage(String.valueOf(body.get("image")).trim());
        }
        if (body.get("description") != null) {
            p.setDescription(String.valueOf(body.get("description")).trim());
        }
        if (body.get("images") != null) {
            try {
                p.setImages(MAPPER.writeValueAsString(body.get("images")));
            } catch (Exception ignored) {}
        }
        p.setRating(BigDecimal.valueOf(4.5));
        p.setReviewsCount(1);

        p = productRepository.save(p);
        return ProductDto.fromEntity(p);
    }

    @Transactional
    public ProductDto updateProduct(Long id, Map<String, Object> body) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        if (body.containsKey("name") && body.get("name") != null) {
            p.setName(String.valueOf(body.get("name")).trim());
        }
        if (body.containsKey("category") && body.get("category") != null) {
            p.setCategory(String.valueOf(body.get("category")).trim());
        }
        if (body.containsKey("price") && body.get("price") != null) {
            p.setPrice(new BigDecimal(String.valueOf(body.get("price"))));
        }
        if (body.containsKey("oldPrice")) {
            Object op = body.get("oldPrice");
            p.setOldPrice(op != null && !String.valueOf(op).trim().isEmpty() ? new BigDecimal(String.valueOf(op)) : null);
        }
        if (body.containsKey("stock") && body.get("stock") != null) {
            p.setStock(Integer.parseInt(String.valueOf(body.get("stock"))));
        }
        if (body.containsKey("image") && body.get("image") != null) {
            p.setImage(String.valueOf(body.get("image")).trim());
        }
        if (body.containsKey("description") && body.get("description") != null) {
            p.setDescription(String.valueOf(body.get("description")).trim());
        }
        if (body.containsKey("images") && body.get("images") != null) {
            try {
                p.setImages(MAPPER.writeValueAsString(body.get("images")));
            } catch (Exception ignored) {}
        }

        p = productRepository.save(p);
        return ProductDto.fromEntity(p);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
    }
}
