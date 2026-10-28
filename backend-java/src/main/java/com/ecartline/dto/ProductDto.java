package com.ecartline.dto;

import com.ecartline.entity.Product;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ProductDto {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private Integer pct;
    private String discount;
    private String image;
    private List<String> images = new ArrayList<>();
    private String category;
    private Integer stock;
    private Boolean inStock;
    private BigDecimal rating;
    private Integer reviews;
    private LocalDateTime createdAt;

    public ProductDto() {}

    public static ProductDto fromEntity(Product p) {
        if (p == null) return null;
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription() != null ? p.getDescription() : "");
        dto.setPrice(p.getPrice());
        dto.setOldPrice(p.getOldPrice() != null ? p.getOldPrice() : p.getPrice());

        if (dto.getOldPrice() != null && dto.getPrice() != null && dto.getOldPrice().compareTo(dto.getPrice()) > 0 && dto.getOldPrice().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal diff = dto.getOldPrice().subtract(dto.getPrice());
            BigDecimal pctVal = diff.divide(dto.getOldPrice(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100));
            int roundedPct = pctVal.setScale(0, RoundingMode.HALF_UP).intValue();
            dto.setPct(roundedPct);
            dto.setDiscount(roundedPct + "% OFF");
        } else {
            dto.setPct(0);
            dto.setDiscount("");
        }

        dto.setImage(p.getImage());
        dto.setCategory(p.getCategory());
        int s = p.getStock() != null ? p.getStock() : 0;
        dto.setStock(s);
        dto.setInStock(s > 0);
        dto.setRating(p.getRating() != null ? p.getRating() : BigDecimal.ZERO);
        dto.setReviews(p.getReviewsCount() != null ? p.getReviewsCount() : 0);
        dto.setCreatedAt(p.getCreatedAt());

        // Parse images JSON
        List<String> imgList = new ArrayList<>();
        if (p.getImages() != null && !p.getImages().trim().isEmpty()) {
            try {
                List<String> parsed = MAPPER.readValue(p.getImages(), new TypeReference<List<String>>() {});
                if (parsed != null && !parsed.isEmpty()) {
                    imgList.addAll(parsed);
                }
            } catch (Exception ignored) {}
        }
        if (imgList.isEmpty() && p.getImage() != null && !p.getImage().trim().isEmpty()) {
            imgList.add(p.getImage());
        }
        dto.setImages(imgList);

        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getOldPrice() { return oldPrice; }
    public void setOldPrice(BigDecimal oldPrice) { this.oldPrice = oldPrice; }

    public Integer getPct() { return pct; }
    public void setPct(Integer pct) { this.pct = pct; }

    public String getDiscount() { return discount; }
    public void setDiscount(String discount) { this.discount = discount; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public Boolean getInStock() { return inStock; }
    public void setInStock(Boolean inStock) { this.inStock = inStock; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getReviews() { return reviews; }
    public void setReviews(Integer reviews) { this.reviews = reviews; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
