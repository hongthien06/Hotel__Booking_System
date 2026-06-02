package com.hotel.modules.holiday.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "holiday_periods")
public class HolidayPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "holiday_id")
    private Long holidayId;

    @Column(name = "name_vi", nullable = false, length = 200)
    private String nameVi;

    @Column(name = "name_en", nullable = false, length = 200)
    private String nameEn;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // 1.5 = tăng 150% (giá × 1.5)
    @Column(name = "price_multiplier", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal priceMultiplier = new BigDecimal("1.50");

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
