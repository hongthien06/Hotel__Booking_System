package com.hotel.modules.holiday.repository;

import com.hotel.modules.holiday.entity.HolidayPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface HolidayPeriodRepository extends JpaRepository<HolidayPeriod, Long> {

    /**
     * Tìm kỳ lễ đang hoạt động chứa ngày check-in.
     * Nếu check-in nằm trong kỳ lễ → áp dụng giá lễ cho toàn bộ booking.
     */
    @Query("SELECT h FROM HolidayPeriod h " +
           "WHERE h.isActive = true " +
           "  AND :date >= h.startDate " +
           "  AND :date <= h.endDate")
    Optional<HolidayPeriod> findActiveByDate(@Param("date") LocalDate date);
}
