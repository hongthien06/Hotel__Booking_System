package com.hotel.common.config;

import com.hotel.modules.auth.entity.Role;
import com.hotel.modules.auth.entity.User;
import com.hotel.modules.auth.repository.RoleRepository;
import com.hotel.modules.auth.repository.UserRepository;
import com.hotel.modules.holiday.entity.GroupDiscountRule;
import com.hotel.modules.holiday.entity.HolidayPeriod;
import com.hotel.modules.holiday.repository.GroupDiscountRuleRepository;
import com.hotel.modules.holiday.repository.HolidayPeriodRepository;
import com.hotel.modules.membership.entity.MembershipTier;
import com.hotel.modules.membership.repository.MembershipTierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final MembershipTierRepository membershipTierRepository;
    private final HolidayPeriodRepository holidayPeriodRepository;
    private final GroupDiscountRuleRepository groupDiscountRuleRepository;

    @Override
    public void run(String... args) {
        // ── Roles & default users ──────────────────────────────────────────────
        Role adminRole    = createRoleIfNotFound("ADMIN",    "Quản trị viên hệ thống");
        Role managerRole  = createRoleIfNotFound("MANAGER",  "Quản lý khách sạn");
        createRoleIfNotFound("CUSTOMER", "Khách hàng");

        createDefaultUser("admin@hotel.com",   "123456", "System Admin",   adminRole);
        createDefaultUser("manager@hotel.com", "123456", "Hotel Manager",  managerRole);

        // ── Membership tiers ───────────────────────────────────────────────────
        seedMembershipTiers();

        // ── Holiday periods ────────────────────────────────────────────────────
        seedHolidayPeriods();

        // ── Group discount rules ───────────────────────────────────────────────
        seedGroupDiscountRules();
    }

    // ── Membership tiers ───────────────────────────────────────────────────────

    private void seedMembershipTiers() {
        if (membershipTierRepository.count() > 0) return;

        membershipTierRepository.save(MembershipTier.builder()
                .tierCode("FIRST_TIME")
                .tierLevel(0)
                .discountPct(new BigDecimal("10.00"))
                .minTotalSpent(BigDecimal.ZERO)
                .minBookingCount(0)
                .displayNameVi("Khách lần đầu")
                .displayNameEn("First-Time Guest")
                .colorCode("#607D8B")
                .benefitsVi("[\"Giảm 10% hóa đơn lần đặt đầu tiên\"]")
                .benefitsEn("[\"10% off your first booking\"]")
                .build());

        membershipTierRepository.save(MembershipTier.builder()
                .tierCode("SILVER")
                .tierLevel(1)
                .discountPct(new BigDecimal("5.00"))
                .minTotalSpent(new BigDecimal("5000000"))
                .minBookingCount(2)
                .displayNameVi("Hội viên Bạc")
                .displayNameEn("Silver Member")
                .colorCode("#9E9E9E")
                .benefitsVi("[\"Giảm 5% mọi đặt phòng\",\"Ưu tiên đặt phòng\"]")
                .benefitsEn("[\"5% off every booking\",\"Priority reservation\"]")
                .build());

        membershipTierRepository.save(MembershipTier.builder()
                .tierCode("GOLD")
                .tierLevel(2)
                .discountPct(new BigDecimal("10.00"))
                .minTotalSpent(new BigDecimal("15000000"))
                .minBookingCount(5)
                .displayNameVi("Hội viên Vàng")
                .displayNameEn("Gold Member")
                .colorCode("#FFC107")
                .benefitsVi("[\"Giảm 10% mọi đặt phòng\",\"Nâng hạng phòng miễn phí\",\"Check-in sớm\"]")
                .benefitsEn("[\"10% off every booking\",\"Free room upgrade\",\"Early check-in\"]")
                .build());

        membershipTierRepository.save(MembershipTier.builder()
                .tierCode("DIAMOND")
                .tierLevel(3)
                .discountPct(new BigDecimal("15.00"))
                .minTotalSpent(new BigDecimal("30000000"))
                .minBookingCount(10)
                .displayNameVi("Hội viên Kim Cương")
                .displayNameEn("Diamond Member")
                .colorCode("#00BCD4")
                .benefitsVi("[\"Giảm 15% mọi đặt phòng\",\"Nâng hạng phòng miễn phí\",\"Dịch vụ miễn phí\",\"Check-in/out linh hoạt\"]")
                .benefitsEn("[\"15% off every booking\",\"Free room upgrade\",\"Complimentary services\",\"Flexible check-in/out\"]")
                .build());

        membershipTierRepository.save(MembershipTier.builder()
                .tierCode("VIP")
                .tierLevel(4)
                .discountPct(new BigDecimal("20.00"))
                .minTotalSpent(new BigDecimal("60000000"))
                .minBookingCount(20)
                .displayNameVi("Hội viên VIP")
                .displayNameEn("VIP Member")
                .colorCode("#9C27B0")
                .benefitsVi("[\"Giảm 20% mọi đặt phòng\",\"Phòng hạng cao nhất\",\"Dịch vụ cá nhân hóa\",\"Đón tiếp sân bay\",\"Ưu đãi sinh nhật đặc biệt\"]")
                .benefitsEn("[\"20% off every booking\",\"Premier room class\",\"Personalized butler service\",\"Airport transfer\",\"Special birthday perks\"]")
                .build());

        System.out.println(">>> Seeded 5 membership tiers");
    }

    // ── Holiday periods ────────────────────────────────────────────────────────

    private void seedHolidayPeriods() {
        if (holidayPeriodRepository.count() > 0) return;

        BigDecimal multiplier = new BigDecimal("1.50");

        holidayPeriodRepository.save(HolidayPeriod.builder()
                .nameVi("Tết Nguyên Đán 2026")
                .nameEn("Lunar New Year 2026")
                .startDate(LocalDate.of(2026, 1, 26))
                .endDate(LocalDate.of(2026, 2, 2))
                .priceMultiplier(multiplier)
                .isActive(true)
                .build());

        holidayPeriodRepository.save(HolidayPeriod.builder()
                .nameVi("Giỗ Tổ Hùng Vương 2026")
                .nameEn("Hung Kings Festival 2026")
                .startDate(LocalDate.of(2026, 4, 6))
                .endDate(LocalDate.of(2026, 4, 7))
                .priceMultiplier(multiplier)
                .isActive(true)
                .build());

        holidayPeriodRepository.save(HolidayPeriod.builder()
                .nameVi("Lễ 30/4 - 1/5 2026")
                .nameEn("Reunification & Labor Day 2026")
                .startDate(LocalDate.of(2026, 4, 30))
                .endDate(LocalDate.of(2026, 5, 1))
                .priceMultiplier(multiplier)
                .isActive(true)
                .build());

        holidayPeriodRepository.save(HolidayPeriod.builder()
                .nameVi("Lễ Quốc Khánh 2026")
                .nameEn("National Day 2026")
                .startDate(LocalDate.of(2026, 9, 2))
                .endDate(LocalDate.of(2026, 9, 3))
                .priceMultiplier(multiplier)
                .isActive(true)
                .build());

        holidayPeriodRepository.save(HolidayPeriod.builder()
                .nameVi("Giáng Sinh & Năm Mới 2026-2027")
                .nameEn("Christmas & New Year 2026-2027")
                .startDate(LocalDate.of(2026, 12, 24))
                .endDate(LocalDate.of(2027, 1, 2))
                .priceMultiplier(multiplier)
                .isActive(true)
                .build());

        System.out.println(">>> Seeded 5 holiday periods");
    }

    // ── Group discount rules ───────────────────────────────────────────────────

    private void seedGroupDiscountRules() {
        if (groupDiscountRuleRepository.count() > 0) return;

        groupDiscountRuleRepository.save(GroupDiscountRule.builder()
                .minGuests(4).maxGuests(5).discountPct(new BigDecimal("5.00")).isActive(true).build());

        groupDiscountRuleRepository.save(GroupDiscountRule.builder()
                .minGuests(6).maxGuests(7).discountPct(new BigDecimal("8.00")).isActive(true).build());

        groupDiscountRuleRepository.save(GroupDiscountRule.builder()
                .minGuests(8).maxGuests(9).discountPct(new BigDecimal("12.00")).isActive(true).build());

        groupDiscountRuleRepository.save(GroupDiscountRule.builder()
                .minGuests(10).maxGuests(null).discountPct(new BigDecimal("15.00")).isActive(true).build());

        System.out.println(">>> Seeded 4 group discount rules");
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private void createDefaultUser(String email, String password, String name, Role role) {
        if (!userRepository.existsByEmail(email)) {
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            User user = User.builder()
                    .fullName(name)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .roles(roles)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            userRepository.save(user);
            System.out.println(">>> Created user: " + email);
        }
    }

    private Role createRoleIfNotFound(String name, String description) {
        return roleRepository.findByRoleName(name)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setRoleName(name);
                    role.setDescription(description);
                    return roleRepository.save(role);
                });
    }
}
