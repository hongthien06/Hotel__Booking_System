package com.hotel.modules.membership.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerMembershipResponse {
    private Long membershipId;
    private Long userId;
    private String userName;
    private String userEmail;
    private MembershipTierResponse tier;
    private BigDecimal totalSpent;
    private Integer bookingCount;
    private Boolean isFirstBookingUsed;
    private LocalDateTime upgradedAt;
    private LocalDateTime createdAt;

    // Progress to next tier
    private MembershipTierResponse nextTier;
    private BigDecimal spentToNextTier;      // còn bao nhiêu tiền để lên hạng tiếp
    private Integer bookingsToNextTier;      // còn bao nhiêu lần đặt để lên hạng tiếp
}
