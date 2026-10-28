package com.ecartline.service;

import com.ecartline.dto.ReviewDtos.*;
import com.ecartline.entity.Product;
import com.ecartline.entity.Review;
import com.ecartline.entity.User;
import com.ecartline.exception.ApiException;
import com.ecartline.repository.ProductRepository;
import com.ecartline.repository.ReviewRepository;
import com.ecartline.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public ReviewSummaryResponse getProductReviews(Long productId) {
        List<Review> list = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        Map<Integer, Integer> breakdown = new LinkedHashMap<>();
        breakdown.put(5, 0);
        breakdown.put(4, 0);
        breakdown.put(3, 0);
        breakdown.put(2, 0);
        breakdown.put(1, 0);

        int sum = 0;
        List<ReviewItemDto> items = new ArrayList<>();

        for (Review r : list) {
            int rating = r.getRating() != null ? r.getRating() : 5;
            breakdown.put(rating, breakdown.getOrDefault(rating, 0) + 1);
            sum += rating;

            ReviewItemDto dto = new ReviewItemDto();
            dto.setId(r.getId());
            dto.setRating(rating);
            dto.setComment(r.getComment());
            dto.setCreatedAt(r.getCreatedAt());
            dto.setUserId(r.getUserId());

            User u = userRepository.findById(r.getUserId()).orElse(null);
            dto.setUserName(u != null ? u.getName() : "Customer");
            items.add(dto);
        }

        double avg = list.isEmpty() ? 0.0 : Math.round(((double) sum / list.size()) * 10.0) / 10.0;

        ReviewSummaryResponse res = new ReviewSummaryResponse();
        res.setSuccess(true);
        res.setCount(list.size());
        res.setAverageRating(avg);
        res.setBreakdown(breakdown);
        res.setData(items);

        return res;
    }

    @Transactional
    public Map<String, Object> addOrUpdateReview(Long userId, Long productId, CreateReviewRequest req) {
        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rating must be a whole number between 1 and 5");
        }

        Product prod = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

        Optional<Review> existing = reviewRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            Review r = existing.get();
            r.setRating(req.getRating());
            r.setComment(req.getComment() != null ? req.getComment().trim() : "");
            r.setCreatedAt(LocalDateTime.now());
            reviewRepository.save(r);
        } else {
            Review r = new Review();
            r.setUserId(userId);
            r.setProductId(productId);
            r.setRating(req.getRating());
            r.setComment(req.getComment() != null ? req.getComment().trim() : "");
            r.setCreatedAt(LocalDateTime.now());
            reviewRepository.save(r);
        }

        Double avgVal = reviewRepository.findAverageRatingByProductId(productId);
        long count = reviewRepository.countByProductId(productId);

        BigDecimal newRating = avgVal != null ? BigDecimal.valueOf(avgVal).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        prod.setRating(newRating);
        prod.setReviewsCount((int) count);
        productRepository.save(prod);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("message", "Thank you! Your review has been saved.");
        res.put("rating", newRating);
        res.put("reviewsCount", count);
        return res;
    }
}
