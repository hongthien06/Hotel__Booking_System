package com.hotel.modules.holiday.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class GroupDiscountRuleRequest {

    @NotNull
    @Min(1)
    private Integer minGuests;

    private Integer maxGuests;  // null = không giới hạn

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private BigDecimal discountPct;

    private Boolean isActive = true;
}
