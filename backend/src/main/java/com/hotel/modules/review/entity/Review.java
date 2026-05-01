package com.hotel.modules.review.entity;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.rooms.entity.Room;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Reviews", schema = "dbo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long reviewId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "rating_overall", nullable = false)
    private Byte ratingOverall;

    @Column(name = "rating_clean")
    private Byte ratingClean;

    @Column(name = "rating_service")
    private Byte ratingService;

    @Column(name = "rating_location")
    private Byte ratingLocation;

    @Column(name = "rating_value")
    private Byte ratingValue;

    @Column(name = "comment", columnDefinition = "NVARCHAR(MAX)")
    private String comment;

    @Column(name = "is_approved", nullable = false)
    @Builder.Default
    private Boolean isApproved = false;

    @Column(name = "admin_reply", columnDefinition = "NVARCHAR(MAX)")
    private String adminReply;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
