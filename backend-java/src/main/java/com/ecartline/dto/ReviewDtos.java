package com.ecartline.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ReviewDtos {

    public static class CreateReviewRequest {
        private Integer rating;
        private String comment;

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    public static class ReviewItemDto {
        private Long id;
        private Integer rating;
        private String comment;

        @JsonProperty("created_at")
        private LocalDateTime createdAt;

        @JsonProperty("user_name")
        private String userName;

        @JsonProperty("user_id")
        private Long userId;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    }

    public static class ReviewSummaryResponse {
        private boolean success = true;
        private int count;
        private Double averageRating;
        private Map<Integer, Integer> breakdown;
        private List<ReviewItemDto> data;

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }

        public Double getAverageRating() { return averageRating; }
        public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

        public Map<Integer, Integer> getBreakdown() { return breakdown; }
        public void setBreakdown(Map<Integer, Integer> breakdown) { this.breakdown = breakdown; }

        public List<ReviewItemDto> getData() { return data; }
        public void setData(List<ReviewItemDto> data) { this.data = data; }
    }
}
