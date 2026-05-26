package com.hotel.modules.membership.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipTierResponse {
    private Long tierId;
    private String tierCode;
    private Integer tierLevel;
    private BigDecimal discountPct;
    private BigDecimal minTotalSpent;
    private Integer minBookingCount;
    private String displayNameVi;
    private String displayNameEn;
    private String colorCode;
    private String benefitsVi;
    private String benefitsEn;
}
