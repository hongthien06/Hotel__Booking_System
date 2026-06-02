package com.hotel.modules.holiday.repository;

import com.hotel.modules.holiday.entity.GroupDiscountRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupDiscountRuleRepository extends JpaRepository<GroupDiscountRule, Long> {

    /**
     * Tìm rule phù hợp nhất với guestCount: minGuests <= guestCount <= maxGuests
     * (hoặc maxGuests IS NULL khi là rule cuối cùng).
     */
    @Query("SELECT r FROM GroupDiscountRule r " +
           "WHERE r.isActive = true " +
           "  AND r.minGuests <= :guestCount " +
           "  AND (r.maxGuests IS NULL OR r.maxGuests >= :guestCount) " +
           "ORDER BY r.minGuests DESC")
    List<GroupDiscountRule> findMatchingRules(@Param("guestCount") int guestCount);

    default Optional<GroupDiscountRule> findBestRule(int guestCount) {
        List<GroupDiscountRule> rules = findMatchingRules(guestCount);
        return rules.isEmpty() ? Optional.empty() : Optional.of(rules.get(0));
    }

    List<GroupDiscountRule> findAllByIsActiveTrueOrderByMinGuestsAsc();
}
