package com.hotel.modules.holiday.service;

import com.hotel.modules.holiday.dto.request.GroupDiscountRuleRequest;
import com.hotel.modules.holiday.dto.request.HolidayPeriodRequest;
import com.hotel.modules.holiday.dto.response.GroupDiscountRuleResponse;
import com.hotel.modules.holiday.dto.response.HolidayPeriodResponse;
import com.hotel.modules.holiday.entity.HolidayPeriod;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IHolidayService {

    // ── Holiday periods (admin) ────────────────────────────
    List<HolidayPeriodResponse> getAllHolidays();
    HolidayPeriodResponse createHoliday(HolidayPeriodRequest request);
    HolidayPeriodResponse updateHoliday(Long id, HolidayPeriodRequest request);
    void deleteHoliday(Long id);

    // ── Group discount rules (admin) ───────────────────────
    List<GroupDiscountRuleResponse> getAllGroupRules();
    GroupDiscountRuleResponse createGroupRule(GroupDiscountRuleRequest request);
    GroupDiscountRuleResponse updateGroupRule(Long id, GroupDiscountRuleRequest request);
    void deleteGroupRule(Long id);

    // ── Internal pricing helpers ───────────────────────────

    /** Trả về HolidayPeriod nếu checkInDate nằm trong kỳ lễ đang active */
    Optional<HolidayPeriod> findHolidayForDate(LocalDate checkInDate);

    /** Trả về % giảm nhóm cho guestCount (0 nếu không có rule phù hợp) */
    BigDecimal getGroupDiscountPct(int guestCount);
}
