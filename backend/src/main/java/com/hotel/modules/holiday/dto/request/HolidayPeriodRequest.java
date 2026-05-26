package com.hotel.modules.holiday.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class HolidayPeriodRequest {

    @NotBlank
    private String nameVi;

    @NotBlank
    private String nameEn;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotNull
    @DecimalMin("1.0")
    @DecimalMax("5.0")
    private BigDecimal priceMultiplier;

    private Boolean isActive = true;
}
