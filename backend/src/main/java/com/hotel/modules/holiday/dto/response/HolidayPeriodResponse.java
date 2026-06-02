package com.hotel.modules.holiday.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HolidayPeriodResponse {
    private Long holidayId;
    private String nameVi;
    private String nameEn;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal priceMultiplier;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
