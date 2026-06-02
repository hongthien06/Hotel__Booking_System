package com.hotel.modules.membership.repository;

import com.hotel.modules.membership.entity.MembershipTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface MembershipTierRepository extends JpaRepository<MembershipTier, Long> {

    Optional<MembershipTier> findByTierCode(String tierCode);

    // Tìm hạng cao nhất mà user đủ điều kiện (dựa trên totalSpent và bookingCount)
    @Query("SELECT t FROM MembershipTier t " +
           "WHERE t.tierCode <> 'FIRST_TIME' " +
           "  AND t.minTotalSpent <= :totalSpent " +
           "  AND t.minBookingCount <= :bookingCount " +
           "ORDER BY t.tierLevel DESC")
    List<MembershipTier> findEligibleTiers(BigDecimal totalSpent, int bookingCount);

    List<MembershipTier> findAllByOrderByTierLevelAsc();
}
