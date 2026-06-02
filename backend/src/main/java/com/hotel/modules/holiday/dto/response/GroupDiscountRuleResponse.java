package com.hotel.modules.holiday.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDiscountRuleResponse {
    private Long ruleId;
    private Integer minGuests;
    private Integer maxGuests;
    private BigDecimal discountPct;
    private Boolean isActive;
}
