package com.hotel.modules.membership.service;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.auth.repository.UserRepository;
import com.hotel.modules.membership.dto.request.UpdateTierConfigRequest;
import com.hotel.modules.membership.dto.response.CustomerMembershipResponse;
import com.hotel.modules.membership.dto.response.MembershipTierResponse;
import com.hotel.modules.membership.entity.CustomerMembership;
import com.hotel.modules.membership.entity.MembershipTier;
import com.hotel.modules.membership.repository.CustomerMembershipRepository;
import com.hotel.modules.membership.repository.MembershipTierRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipService implements IMembershipService {

    private static final String FIRST_TIME_CODE = "FIRST_TIME";
    private static final BigDecimal FIRST_TIME_DISCOUNT = new BigDecimal("10.00");

    private final MembershipTierRepository tierRepository;
    private final CustomerMembershipRepository membershipRepository;
    private final UserRepository userRepository;

    // ── Admin ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<MembershipTierResponse> getAllTiers() {
        return tierRepository.findAllByOrderByTierLevelAsc()
                .stream()
                .map(this::toTierResponse)
                .toList();
    }

    @Override
    @Transactional
    public MembershipTierResponse updateTierConfig(Long tierId, UpdateTierConfigRequest req) {
        MembershipTier tier = tierRepository.findById(tierId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hạng id=" + tierId));

        if (req.getDiscountPct() != null)    tier.setDiscountPct(req.getDiscountPct());
        if (req.getMinTotalSpent() != null)  tier.setMinTotalSpent(req.getMinTotalSpent());
        if (req.getMinBookingCount() != null) tier.setMinBookingCount(req.getMinBookingCount());
        if (req.getDisplayNameVi() != null)  tier.setDisplayNameVi(req.getDisplayNameVi());
        if (req.getDisplayNameEn() != null)  tier.setDisplayNameEn(req.getDisplayNameEn());
        if (req.getColorCode() != null)      tier.setColorCode(req.getColorCode());
        if (req.getBenefitsVi() != null)     tier.setBenefitsVi(req.getBenefitsVi());
        if (req.getBenefitsEn() != null)     tier.setBenefitsEn(req.getBenefitsEn());

        tier = tierRepository.save(tier);
        log.info("MembershipTier updated: id={}, code={}", tierId, tier.getTierCode());
        return toTierResponse(tier);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerMembershipResponse> getAllCustomerMemberships(Pageable pageable) {
        return membershipRepository.findAllWithDetails(pageable)
                .map(this::toMembershipResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerMembershipResponse getCustomerMembership(Long userId) {
        CustomerMembership cm = membershipRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy membership cho userId=" + userId));
        return toMembershipResponse(cm);
    }

    @Override
    @Transactional
    public CustomerMembershipResponse manualUpgrade(Long userId, String tierCode) {
        CustomerMembership cm = getOrCreateMembership(userId);
        MembershipTier newTier = tierRepository.findByTierCode(tierCode.toUpperCase())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hạng: " + tierCode));

        cm.setTier(newTier);
        cm.setUpgradedAt(LocalDateTime.now());
        cm.setUpdatedAt(LocalDateTime.now());
        membershipRepository.save(cm);

        log.info("Manual upgrade userId={} → {}", userId, tierCode);
        return toMembershipResponse(cm);
    }

    // ── Customer ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public CustomerMembershipResponse getMyMembership(Long userId) {
        CustomerMembership cm = getOrCreateMembership(userId);
        return toMembershipResponse(cm);
    }

    // ── Internal ───────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public CustomerMembership getOrCreateMembership(Long userId) {
        return membershipRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new EntityNotFoundException(
                                    "User không tồn tại: " + userId));
                    MembershipTier firstTier = tierRepository.findByTierCode(FIRST_TIME_CODE)
                            .orElseThrow(() -> new IllegalStateException(
                                    "Tier FIRST_TIME chưa được seed vào DB"));
                    CustomerMembership cm = CustomerMembership.builder()
                            .user(user)
                            .tier(firstTier)
                            .totalSpent(BigDecimal.ZERO)
                            .bookingCount(0)
                            .isFirstBookingUsed(false)
                            .build();
                    return membershipRepository.save(cm);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getFirstBookingDiscountPct(Long userId) {
        CustomerMembership cm = membershipRepository.findByUser_UserId(userId).orElse(null);
        if (cm == null || !cm.getIsFirstBookingUsed()) {
            return FIRST_TIME_DISCOUNT;
        }
        return BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getCurrentTierDiscountPct(Long userId) {
        CustomerMembership cm = membershipRepository.findByUser_UserId(userId).orElse(null);
        if (cm == null) return BigDecimal.ZERO;
        MembershipTier tier = cm.getTier();
        // FIRST_TIME tier discount chỉ áp dụng qua getFirstBookingDiscountPct
        if (FIRST_TIME_CODE.equals(tier.getTierCode())) return BigDecimal.ZERO;
        return tier.getDiscountPct();
    }

    @Override
    @Transactional
    public void recordCompletedBooking(Long userId, BigDecimal paidAmount) {
        CustomerMembership cm = getOrCreateMembership(userId);

        cm.setTotalSpent(cm.getTotalSpent().add(paidAmount));
        cm.setBookingCount(cm.getBookingCount() + 1);
        cm.setIsFirstBookingUsed(true);
        cm.setUpdatedAt(LocalDateTime.now());

        // Tự động xét lên hạng
        List<MembershipTier> eligible = tierRepository
                .findEligibleTiers(cm.getTotalSpent(), cm.getBookingCount());

        if (!eligible.isEmpty()) {
            MembershipTier best = eligible.get(0);  // đã sort DESC — hạng cao nhất trước
            if (best.getTierLevel() > cm.getTier().getTierLevel()) {
                log.info("Auto-upgrade userId={}: {} → {}", userId,
                        cm.getTier().getTierCode(), best.getTierCode());
                cm.setTier(best);
                cm.setUpgradedAt(LocalDateTime.now());
            }
        }

        membershipRepository.save(cm);
    }

    // ── Mappers ────────────────────────────────────────────────────────────────

    private MembershipTierResponse toTierResponse(MembershipTier t) {
        return MembershipTierResponse.builder()
                .tierId(t.getTierId())
                .tierCode(t.getTierCode())
                .tierLevel(t.getTierLevel())
                .discountPct(t.getDiscountPct())
                .minTotalSpent(t.getMinTotalSpent())
                .minBookingCount(t.getMinBookingCount())
                .displayNameVi(t.getDisplayNameVi())
                .displayNameEn(t.getDisplayNameEn())
                .colorCode(t.getColorCode())
                .benefitsVi(t.getBenefitsVi())
                .benefitsEn(t.getBenefitsEn())
                .build();
    }

    private CustomerMembershipResponse toMembershipResponse(CustomerMembership cm) {
        List<MembershipTier> allTiers = tierRepository.findAllByOrderByTierLevelAsc();

        // Tìm hạng tiếp theo
        MembershipTierResponse nextTierResp = null;
        BigDecimal spentToNext = null;
        Integer bookingsToNext = null;

        for (MembershipTier t : allTiers) {
            if (t.getTierLevel() > cm.getTier().getTierLevel()
                    && !FIRST_TIME_CODE.equals(t.getTierCode())) {
                nextTierResp = toTierResponse(t);
                BigDecimal spentGap = t.getMinTotalSpent().subtract(cm.getTotalSpent());
                spentToNext = spentGap.compareTo(BigDecimal.ZERO) > 0 ? spentGap : BigDecimal.ZERO;
                int bookingGap = t.getMinBookingCount() - cm.getBookingCount();
                bookingsToNext = bookingGap > 0 ? bookingGap : 0;
                break;
            }
        }

        return CustomerMembershipResponse.builder()
                .membershipId(cm.getMembershipId())
                .userId(cm.getUser().getUserId())
                .userName(cm.getUser().getFullName())
                .userEmail(cm.getUser().getEmail())
                .tier(toTierResponse(cm.getTier()))
                .totalSpent(cm.getTotalSpent())
                .bookingCount(cm.getBookingCount())
                .isFirstBookingUsed(cm.getIsFirstBookingUsed())
                .upgradedAt(cm.getUpgradedAt())
                .createdAt(cm.getCreatedAt())
                .nextTier(nextTierResp)
                .spentToNextTier(spentToNext)
                .bookingsToNextTier(bookingsToNext)
                .build();
    }
}
