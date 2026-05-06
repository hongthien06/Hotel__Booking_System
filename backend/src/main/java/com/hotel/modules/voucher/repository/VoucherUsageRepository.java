package com.hotel.modules.voucher.repository;

import com.hotel.modules.voucher.entity.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {

    Optional<VoucherUsage> findByBooking_BookingId(Long bookingId);

    // Dem so lan user da dung voucher nay (de kiem tra usageLimitPerUser)
    int countByVoucher_VoucherIdAndUser_UserId(Long voucherId, Long userId);

    boolean existsByBooking_BookingId(Long bookingId);
}
