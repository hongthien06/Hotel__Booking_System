package com.hotel.modules.membership.entity;

import com.hotel.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "customer_memberships")
public class CustomerMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "membership_id")
    private Long membershipId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tier_id", nullable = false)
    private MembershipTier tier;

    @Column(name = "total_spent", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @Column(name = "booking_count", nullable = false)
    @Builder.Default
    private Integer bookingCount = 0;

    // true = ưu đãi 10% lần đầu đã được áp dụng cho một booking rồi
    @Column(name = "is_first_booking_used", nullable = false)
    @Builder.Default
    private Boolean isFirstBookingUsed = false;

    @Column(name = "upgraded_at")
    private LocalDateTime upgradedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
