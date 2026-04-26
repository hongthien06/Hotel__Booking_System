package com.hotel.modules.invoice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.room.entity.Room;

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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

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