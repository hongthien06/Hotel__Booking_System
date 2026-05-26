package com.hotel.modules.holiday.controller;

import com.hotel.modules.holiday.dto.request.GroupDiscountRuleRequest;
import com.hotel.modules.holiday.dto.request.HolidayPeriodRequest;
import com.hotel.modules.holiday.dto.response.GroupDiscountRuleResponse;
import com.hotel.modules.holiday.dto.response.HolidayPeriodResponse;
import com.hotel.modules.holiday.service.IHolidayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/holidays")
@RequiredArgsConstructor
public class HolidayController {

    private final IHolidayService holidayService;

    // ── Holiday Periods ────────────────────────────────────────────────────────

    /** GET /holidays — danh sách kỳ lễ (public, dùng cho booking page) */
    @GetMapping
    public ResponseEntity<List<HolidayPeriodResponse>> getAllHolidays() {
        return ResponseEntity.ok(holidayService.getAllHolidays());
    }

    /** POST /holidays */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<HolidayPeriodResponse> createHoliday(
            @Valid @RequestBody HolidayPeriodRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(holidayService.createHoliday(request));
    }

    /** PUT /holidays/{id} */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<HolidayPeriodResponse> updateHoliday(
            @PathVariable Long id,
            @Valid @RequestBody HolidayPeriodRequest request) {
        return ResponseEntity.ok(holidayService.updateHoliday(id, request));
    }

    /** DELETE /holidays/{id} */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> deleteHoliday(@PathVariable Long id) {
        holidayService.deleteHoliday(id);
        return ResponseEntity.noContent().build();
    }

    // ── Group Discount Rules ───────────────────────────────────────────────────

    /** GET /holidays/group-rules */
    @GetMapping("/group-rules")
    public ResponseEntity<List<GroupDiscountRuleResponse>> getAllGroupRules() {
        return ResponseEntity.ok(holidayService.getAllGroupRules());
    }

    /** POST /holidays/group-rules */
    @PostMapping("/group-rules")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<GroupDiscountRuleResponse> createGroupRule(
            @Valid @RequestBody GroupDiscountRuleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(holidayService.createGroupRule(request));
    }

    /** PUT /holidays/group-rules/{id} */
    @PutMapping("/group-rules/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<GroupDiscountRuleResponse> updateGroupRule(
            @PathVariable Long id,
            @Valid @RequestBody GroupDiscountRuleRequest request) {
        return ResponseEntity.ok(holidayService.updateGroupRule(id, request));
    }

    /** DELETE /holidays/group-rules/{id} */
    @DeleteMapping("/group-rules/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Void> deleteGroupRule(@PathVariable Long id) {
        holidayService.deleteGroupRule(id);
        return ResponseEntity.noContent().build();
    }
}
