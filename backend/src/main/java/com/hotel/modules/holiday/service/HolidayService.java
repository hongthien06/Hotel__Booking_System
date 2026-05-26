package com.hotel.modules.holiday.service;

import com.hotel.modules.holiday.dto.request.GroupDiscountRuleRequest;
import com.hotel.modules.holiday.dto.request.HolidayPeriodRequest;
import com.hotel.modules.holiday.dto.response.GroupDiscountRuleResponse;
import com.hotel.modules.holiday.dto.response.HolidayPeriodResponse;
import com.hotel.modules.holiday.entity.GroupDiscountRule;
import com.hotel.modules.holiday.entity.HolidayPeriod;
import com.hotel.modules.holiday.repository.GroupDiscountRuleRepository;
import com.hotel.modules.holiday.repository.HolidayPeriodRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class HolidayService implements IHolidayService {

    private final HolidayPeriodRepository holidayRepo;
    private final GroupDiscountRuleRepository groupRuleRepo;

    // ── Holiday Periods ────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<HolidayPeriodResponse> getAllHolidays() {
        return holidayRepo.findAll().stream().map(this::toHolidayResponse).toList();
    }

    @Override
    @Transactional
    public HolidayPeriodResponse createHoliday(HolidayPeriodRequest req) {
        validateHolidayDates(req.getStartDate(), req.getEndDate());
        HolidayPeriod h = HolidayPeriod.builder()
                .nameVi(req.getNameVi())
                .nameEn(req.getNameEn())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .priceMultiplier(req.getPriceMultiplier())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .build();
        h = holidayRepo.save(h);
        log.info("Holiday created: id={}, name={}", h.getHolidayId(), h.getNameVi());
        return toHolidayResponse(h);
    }

    @Override
    @Transactional
    public HolidayPeriodResponse updateHoliday(Long id, HolidayPeriodRequest req) {
        HolidayPeriod h = findHolidayOrThrow(id);
        validateHolidayDates(req.getStartDate(), req.getEndDate());
        h.setNameVi(req.getNameVi());
        h.setNameEn(req.getNameEn());
        h.setStartDate(req.getStartDate());
        h.setEndDate(req.getEndDate());
        h.setPriceMultiplier(req.getPriceMultiplier());
        if (req.getIsActive() != null) h.setIsActive(req.getIsActive());
        h = holidayRepo.save(h);
        return toHolidayResponse(h);
    }

    @Override
    @Transactional
    public void deleteHoliday(Long id) {
        findHolidayOrThrow(id);
        holidayRepo.deleteById(id);
        log.info("Holiday deleted: id={}", id);
    }

    // ── Group Discount Rules ───────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<GroupDiscountRuleResponse> getAllGroupRules() {
        return groupRuleRepo.findAllByIsActiveTrueOrderByMinGuestsAsc()
                .stream().map(this::toRuleResponse).toList();
    }

    @Override
    @Transactional
    public GroupDiscountRuleResponse createGroupRule(GroupDiscountRuleRequest req) {
        GroupDiscountRule rule = GroupDiscountRule.builder()
                .minGuests(req.getMinGuests())
                .maxGuests(req.getMaxGuests())
                .discountPct(req.getDiscountPct())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .build();
        rule = groupRuleRepo.save(rule);
        return toRuleResponse(rule);
    }

    @Override
    @Transactional
    public GroupDiscountRuleResponse updateGroupRule(Long id, GroupDiscountRuleRequest req) {
        GroupDiscountRule rule = groupRuleRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Rule không tồn tại: " + id));
        if (req.getMinGuests() != null) rule.setMinGuests(req.getMinGuests());
        if (req.getMaxGuests() != null) rule.setMaxGuests(req.getMaxGuests());
        if (req.getDiscountPct() != null) rule.setDiscountPct(req.getDiscountPct());
        if (req.getIsActive() != null) rule.setIsActive(req.getIsActive());
        rule = groupRuleRepo.save(rule);
        return toRuleResponse(rule);
    }

    @Override
    @Transactional
    public void deleteGroupRule(Long id) {
        groupRuleRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Rule không tồn tại: " + id));
        groupRuleRepo.deleteById(id);
    }

    // ── Internal Helpers ───────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Optional<HolidayPeriod> findHolidayForDate(LocalDate checkInDate) {
        return holidayRepo.findActiveByDate(checkInDate);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getGroupDiscountPct(int guestCount) {
        return groupRuleRepo.findBestRule(guestCount)
                .map(GroupDiscountRule::getDiscountPct)
                .orElse(BigDecimal.ZERO);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private void validateHolidayDates(LocalDate start, LocalDate end) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
        }
    }

    private HolidayPeriod findHolidayOrThrow(Long id) {
        return holidayRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy holiday id=" + id));
    }

    private HolidayPeriodResponse toHolidayResponse(HolidayPeriod h) {
        return HolidayPeriodResponse.builder()
                .holidayId(h.getHolidayId())
                .nameVi(h.getNameVi())
                .nameEn(h.getNameEn())
                .startDate(h.getStartDate())
                .endDate(h.getEndDate())
                .priceMultiplier(h.getPriceMultiplier())
                .isActive(h.getIsActive())
                .createdAt(h.getCreatedAt())
                .build();
    }

    private GroupDiscountRuleResponse toRuleResponse(GroupDiscountRule r) {
        return GroupDiscountRuleResponse.builder()
                .ruleId(r.getRuleId())
                .minGuests(r.getMinGuests())
                .maxGuests(r.getMaxGuests())
                .discountPct(r.getDiscountPct())
                .isActive(r.getIsActive())
                .build();
    }
}
