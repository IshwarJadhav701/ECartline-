package com.ecartline.controller;

import com.ecartline.config.UserPrincipal;
import com.ecartline.dto.ReviewDtos.*;
import com.ecartline.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ReviewSummaryResponse> getProductReviews(@PathVariable Long productId) {
        ReviewSummaryResponse res = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<Map<String, Object>> addOrUpdateReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @RequestBody CreateReviewRequest req) {
        Map<String, Object> res = reviewService.addOrUpdateReview(principal.getId(), productId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }
}
