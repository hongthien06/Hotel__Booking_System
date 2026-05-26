package com.hotel.modules.membership.entity;

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
@Table(name = "membership_tiers")
public class MembershipTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tier_id")
    private Long tierId;

    @Column(name = "tier_code", nullable = false, unique = true, length = 20)
    private String tierCode;  // FIRST_TIME, SILVER, GOLD, DIAMOND, VIP

    @Column(name = "tier_level", nullable = false)
    private Integer tierLevel;  // 0..4

    @Column(name = "discount_pct", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountPct;

    @Column(name = "min_total_spent", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal minTotalSpent = BigDecimal.ZERO;

    @Column(name = "min_booking_count", nullable = false)
    @Builder.Default
    private Integer minBookingCount = 0;

    @Column(name = "display_name_vi", nullable = false, length = 100)
    private String displayNameVi;

    @Column(name = "display_name_en", nullable = false, length = 100)
    private String displayNameEn;

    @Column(name = "color_code", length = 10)
    private String colorCode;

    @Column(name = "benefits_vi", columnDefinition = "NVARCHAR(MAX)")
    private String benefitsVi;

    @Column(name = "benefits_en", columnDefinition = "NVARCHAR(MAX)")
    private String benefitsEn;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
