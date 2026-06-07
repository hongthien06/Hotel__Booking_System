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
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipService implements IMembershipService {

    private static final String FIRST_TIME_CODE = "FIRST_TIME";
    private static final BigDecimal FIRST_TIME_DISCOUNT = new BigDecimal("10.00");

    private final MembershipTierRepository tierRepository;
    private final CustomerMembershipRepository membershipRepository;
    private final UserRepository userRepository;

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
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay hang id=" + tierId));

        if (req.getDiscountPct() != null) {
            tier.setDiscountPct(req.getDiscountPct());
        }
        if (req.getMinTotalSpent() != null) {
            tier.setMinTotalSpent(req.getMinTotalSpent());
        }
        if (req.getMinBookingCount() != null) {
            tier.setMinBookingCount(req.getMinBookingCount());
        }
        if (req.getDisplayNameVi() != null) {
            tier.setDisplayNameVi(req.getDisplayNameVi());
        }
        if (req.getDisplayNameEn() != null) {
            tier.setDisplayNameEn(req.getDisplayNameEn());
        }
        if (req.getColorCode() != null) {
            tier.setColorCode(req.getColorCode());
        }
        if (req.getBenefitsVi() != null) {
            tier.setBenefitsVi(req.getBenefitsVi());
        }
        if (req.getBenefitsEn() != null) {
            tier.setBenefitsEn(req.getBenefitsEn());
        }

        tier = tierRepository.save(tier);
        log.info("MembershipTier updated: id={}, code={}", tierId, tier.getTierCode());
        return toTierResponse(tier);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerMembershipResponse> getAllCustomerMemberships(Pageable pageable) {
        return membershipRepository.findAllWithDetails(pageable)
                .map(cm -> toMembershipResponse(cm, null));
    }

    @Override
    @Transactional
    public CustomerMembershipResponse getCustomerMembership(Long userId) {
        User user = getUserOrThrow(userId);
        CustomerMembership cm = resolveMembershipForUser(user, true);
        return toMembershipResponse(cm, user);
    }

    @Override
    @Transactional
    public CustomerMembershipResponse manualUpgrade(Long userId, String tierCode) {
        User user = getUserOrThrow(userId);
        CustomerMembership cm = resolveMembershipForUser(user, true);
        MembershipTier newTier = tierRepository.findByTierCode(tierCode.toUpperCase())
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay hang: " + tierCode));

        cm.setTier(newTier);
        cm.setUpgradedAt(LocalDateTime.now());
        cm.setUpdatedAt(LocalDateTime.now());
        membershipRepository.save(cm);

        log.info("Manual upgrade userId={} -> {}", userId, tierCode);
        return toMembershipResponse(cm, user);
    }

    @Override
    @Transactional
    public CustomerMembershipResponse getMyMembership(Long userId) {
        User user = getUserOrThrow(userId);
        CustomerMembership cm = resolveMembershipForUser(user, true);
        return toMembershipResponse(cm, user);
    }

    @Override
    @Transactional
    public CustomerMembership getOrCreateMembership(Long userId) {
        return resolveMembershipForUser(getUserOrThrow(userId), true);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getFirstBookingDiscountPct(Long userId) {
        CustomerMembership cm = resolveMembershipForUser(getUserOrThrow(userId), false);
        if (cm == null || !Boolean.TRUE.equals(cm.getIsFirstBookingUsed())) {
            return FIRST_TIME_DISCOUNT;
        }
        return BigDecimal.ZERO;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getCurrentTierDiscountPct(Long userId) {
        CustomerMembership cm = resolveMembershipForUser(getUserOrThrow(userId), false);
        if (cm == null) {
            return BigDecimal.ZERO;
        }

        MembershipTier tier = cm.getTier();
        if (FIRST_TIME_CODE.equals(tier.getTierCode())) {
            return BigDecimal.ZERO;
        }
        return tier.getDiscountPct();
    }

    @Override
    @Transactional
    public void recordCompletedBooking(Long userId, BigDecimal paidAmount) {
        CustomerMembership cm = resolveMembershipForUser(getUserOrThrow(userId), true);

        cm.setTotalSpent(cm.getTotalSpent().add(paidAmount));
        cm.setBookingCount(cm.getBookingCount() + 1);
        cm.setIsFirstBookingUsed(true);
        cm.setUpdatedAt(LocalDateTime.now());

        List<MembershipTier> eligible = tierRepository.findEligibleTiers(cm.getTotalSpent());

        if (!eligible.isEmpty()) {
            MembershipTier best = eligible.get(0);
            if (best.getTierLevel() > cm.getTier().getTierLevel()) {
                log.info("Auto-upgrade membershipId={}: {} -> {}",
                        cm.getMembershipId(), cm.getTier().getTierCode(), best.getTierCode());
                cm.setTier(best);
                cm.setUpgradedAt(LocalDateTime.now());
            }
        }

        membershipRepository.save(cm);
    }

    private MembershipTierResponse toTierResponse(MembershipTier tier) {
        return MembershipTierResponse.builder()
                .tierId(tier.getTierId())
                .tierCode(tier.getTierCode())
                .tierLevel(tier.getTierLevel())
                .discountPct(tier.getDiscountPct())
                .minTotalSpent(tier.getMinTotalSpent())
                .minBookingCount(tier.getMinBookingCount())
                .displayNameVi(tier.getDisplayNameVi())
                .displayNameEn(tier.getDisplayNameEn())
                .colorCode(tier.getColorCode())
                .benefitsVi(tier.getBenefitsVi())
                .benefitsEn(tier.getBenefitsEn())
                .build();
    }

    private CustomerMembershipResponse toMembershipResponse(CustomerMembership cm, User requestedUser) {
        List<MembershipTier> allTiers = tierRepository.findAllByOrderByTierLevelAsc();
        User responseUser = requestedUser != null ? requestedUser : cm.getUser();

        MembershipTierResponse nextTierResp = null;
        BigDecimal spentToNext = null;
        for (MembershipTier tier : allTiers) {
            if (tier.getTierLevel() > cm.getTier().getTierLevel()
                    && !FIRST_TIME_CODE.equals(tier.getTierCode())) {
                nextTierResp = toTierResponse(tier);
                BigDecimal spentGap = tier.getMinTotalSpent().subtract(cm.getTotalSpent());
                spentToNext = spentGap.compareTo(BigDecimal.ZERO) > 0 ? spentGap : BigDecimal.ZERO;
                break;
            }
        }

        return CustomerMembershipResponse.builder()
                .membershipId(cm.getMembershipId())
                .userId(responseUser.getUserId())
                .userName(responseUser.getFullName())
                .userEmail(responseUser.getEmail())
                .userPhone(normalizePhone(responseUser.getPhone()))
                .tier(toTierResponse(cm.getTier()))
                .totalSpent(cm.getTotalSpent())
                .bookingCount(cm.getBookingCount())
                .isFirstBookingUsed(cm.getIsFirstBookingUsed())
                .upgradedAt(cm.getUpgradedAt())
                .createdAt(cm.getCreatedAt())
                .nextTier(nextTierResp)
                .spentToNextTier(spentToNext)
                .bookingsToNextTier(null)
                .build();
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User khong ton tai: " + userId));
    }

    private CustomerMembership resolveMembershipForUser(User user, boolean createIfMissing) {
        String phone = normalizePhone(user.getPhone());
        if (phone != null) {
            Optional<CustomerMembership> byPhone = membershipRepository
                    .findFirstByUser_PhoneOrderByMembershipIdAsc(phone);
            if (byPhone.isPresent()) {
                return byPhone.get();
            }
        }

        Optional<CustomerMembership> byUser = membershipRepository.findByUser_UserId(user.getUserId());
        if (byUser.isPresent()) {
            return byUser.get();
        }

        return createIfMissing ? createMembershipForUser(user) : null;
    }

    private CustomerMembership createMembershipForUser(User user) {
        MembershipTier firstTier = tierRepository.findByTierCode(FIRST_TIME_CODE)
                .orElseThrow(() -> new IllegalStateException("Tier FIRST_TIME chua duoc seed vao DB"));

        CustomerMembership membership = CustomerMembership.builder()
                .user(user)
                .tier(firstTier)
                .totalSpent(BigDecimal.ZERO)
                .bookingCount(0)
                .isFirstBookingUsed(false)
                .build();
        return membershipRepository.save(membership);
    }

    private String normalizePhone(String phone) {
        if (phone == null) {
            return null;
        }
        String normalized = phone.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
