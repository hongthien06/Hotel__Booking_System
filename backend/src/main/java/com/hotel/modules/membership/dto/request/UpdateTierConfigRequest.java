package com.hotel.modules.membership.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateTierConfigRequest {

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private BigDecimal discountPct;

    @DecimalMin(value = "0.0")
    private BigDecimal minTotalSpent;

    @Min(0)
    private Integer minBookingCount;

    private String displayNameVi;
    private String displayNameEn;
    private String colorCode;
    private String benefitsVi;
    private String benefitsEn;
}
