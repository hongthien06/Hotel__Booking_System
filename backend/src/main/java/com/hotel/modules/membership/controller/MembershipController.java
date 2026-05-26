package com.hotel.modules.membership.controller;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.membership.dto.request.UpdateTierConfigRequest;
import com.hotel.modules.membership.dto.response.CustomerMembershipResponse;
import com.hotel.modules.membership.dto.response.MembershipTierResponse;
import com.hotel.modules.membership.service.IMembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/membership")
@RequiredArgsConstructor
public class MembershipController {

    private final IMembershipService membershipService;

    // ── Public / Customer ──────────────────────────────────────────────────────

    /** GET /membership/tiers — danh sách tất cả các hạng (public) */
    @GetMapping("/tiers")
    public ResponseEntity<List<MembershipTierResponse>> getAllTiers() {
        return ResponseEntity.ok(membershipService.getAllTiers());
    }

    /** GET /membership/me — hạng + tiến trình của user đang đăng nhập */
    @GetMapping("/me")
    public ResponseEntity<CustomerMembershipResponse> getMyMembership(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(membershipService.getMyMembership(user.getUserId()));
    }

    // ── Admin / Manager ────────────────────────────────────────────────────────

    /** PUT /membership/tiers/{id} — cập nhật cấu hình 1 hạng */
    @PutMapping("/tiers/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<MembershipTierResponse> updateTierConfig(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTierConfigRequest request) {
        return ResponseEntity.ok(membershipService.updateTierConfig(id, request));
    }

    /** GET /membership/customers — danh sách khách + hạng */
    @GetMapping("/customers")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Page<CustomerMembershipResponse>> getAllCustomers(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(membershipService.getAllCustomerMemberships(pageable));
    }

    /** GET /membership/customers/{userId} — chi tiết hạng 1 khách */
    @GetMapping("/customers/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<CustomerMembershipResponse> getCustomerMembership(
            @PathVariable Long userId) {
        return ResponseEntity.ok(membershipService.getCustomerMembership(userId));
    }

    /** PUT /membership/customers/{userId}/upgrade — nâng hạng thủ công */
    @PutMapping("/customers/{userId}/upgrade")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<CustomerMembershipResponse> manualUpgrade(
            @PathVariable Long userId,
            @RequestParam String tierCode) {
        return ResponseEntity.ok(membershipService.manualUpgrade(userId, tierCode));
    }
}
