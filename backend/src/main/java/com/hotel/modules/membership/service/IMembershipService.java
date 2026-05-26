package com.hotel.modules.membership.service;

import com.hotel.modules.membership.dto.request.UpdateTierConfigRequest;
import com.hotel.modules.membership.dto.response.CustomerMembershipResponse;
import com.hotel.modules.membership.dto.response.MembershipTierResponse;
import com.hotel.modules.membership.entity.CustomerMembership;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface IMembershipService {

    // ── Admin ──────────────────────────────────────────────
    List<MembershipTierResponse> getAllTiers();
    MembershipTierResponse updateTierConfig(Long tierId, UpdateTierConfigRequest request);
    Page<CustomerMembershipResponse> getAllCustomerMemberships(Pageable pageable);
    CustomerMembershipResponse getCustomerMembership(Long userId);
    CustomerMembershipResponse manualUpgrade(Long userId, String tierCode);

    // ── Customer ───────────────────────────────────────────
    CustomerMembershipResponse getMyMembership(Long userId);

    // ── Internal (called by BookingService / PaymentService) ─
    CustomerMembership getOrCreateMembership(Long userId);

    /**
     * Áp dụng ưu đãi lần đầu: trả về % giảm giá (10%) nếu chưa dùng, 0 nếu đã dùng.
     * KHÔNG ghi lại việc đã dùng — chỉ đọc trạng thái.
     */
    BigDecimal getFirstBookingDiscountPct(Long userId);

    /**
     * Lấy % giảm giá theo hạng hiện tại (không tính ưu đãi lần đầu).
     */
    BigDecimal getCurrentTierDiscountPct(Long userId);

    /**
     * Gọi sau khi payment thành công: cộng chi tiêu, tăng booking_count,
     * đánh dấu first_booking_used, tự động lên hạng nếu đủ điều kiện.
     */
    void recordCompletedBooking(Long userId, BigDecimal paidAmount);
}
