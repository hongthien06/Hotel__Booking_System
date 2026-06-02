package com.hotel.modules.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponseDTO {
    private Long reviewId;
    private Long bookingId;
    private String bookingCode;
    private String customerName;
    private String customerAvatar;
    private String roomNumber;
    private String hotelName;
    private Byte ratingOverall;
    private Byte ratingClean;
    private Byte ratingService;
    private Byte ratingLocation;
    private Byte ratingValue;
    private String comment;
    private Boolean isApproved;
    private String adminReply;
    private LocalDateTime createdAt;
}
