package com.hotel.modules.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewRequestDTO {
    @NotNull(message = "Booking ID không được để trống")
    private Long bookingId;

    @NotNull(message = "Đánh giá tổng thể không được để trống")
    @Min(value = 1, message = "Đánh giá tối thiểu là 1")
    @Max(value = 5, message = "Đánh giá tối đa là 5")
    private Byte ratingOverall;

    @Min(1) @Max(5)
    private Byte ratingClean;

    @Min(1) @Max(5)
    private Byte ratingService;

    @Min(1) @Max(5)
    private Byte ratingLocation;

    @Min(1) @Max(5)
    private Byte ratingValue;

    private String comment;
}
