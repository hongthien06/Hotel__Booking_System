package com.hotel.modules.invoice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "rating_overall", nullable = false)
    private Integer ratingOverall;

    @Column(name = "rating_clean")
    private Integer ratingClean;

    @Column(name = "rating_service")
    private Integer ratingService;

    @Column(name = "rating_location")
    private Integer ratingLocation;

    @Column(name = "rating_value")
    private Integer ratingValue;

    @Column(name = "comment", columnDefinition = "NVARCHAR(MAX)")
    private String comment;

    @Column(name = "is_approved", nullable = false)
    @Builder.Default
    private Boolean isApproved = false;

    @Column(name = "admin_reply", columnDefinition = "NVARCHAR(MAX)")
    private String adminReply;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}