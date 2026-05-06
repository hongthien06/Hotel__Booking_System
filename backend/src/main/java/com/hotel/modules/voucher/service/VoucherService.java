package com.hotel.modules.voucher.service;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.entity.BookingStatus;
import com.hotel.modules.booking.repository.BookingRepository;
import com.hotel.modules.voucher.dto.request.ApplyVoucherRequest;
import com.hotel.modules.voucher.dto.request.VoucherCreateRequest;
import com.hotel.modules.voucher.dto.request.VoucherUpdateRequest;
import com.hotel.modules.voucher.dto.response.ApplyVoucherResponse;
import com.hotel.modules.voucher.dto.response.VoucherResponse;
import com.hotel.modules.voucher.entity.DiscountType;
import com.hotel.modules.voucher.entity.Voucher;
import com.hotel.modules.voucher.entity.VoucherStatus;
import com.hotel.modules.voucher.entity.VoucherUsage;
import com.hotel.modules.voucher.repository.VoucherRepository;
import com.hotel.modules.voucher.repository.VoucherUsageRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoucherService implements IVoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherCreateRequest request) {
        if (voucherRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new IllegalStateException("Mã voucher '" + request.getCode() + "' đã tồn tại");
        }

        if (request.getDiscountType() == DiscountType.PERCENTAGE
                && (request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0)) {
            throw new IllegalArgumentException("Phần trăm giảm giá không được vượt quá 100%");
        }

        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        Voucher voucher = Voucher.builder()
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount() != null
                        ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .usageLimitPerUser(request.getUsageLimitPerUser() != null
                        ? request.getUsageLimitPerUser() : 1)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        voucher = voucherRepository.save(voucher);
        log.info("Voucher created: code={}", voucher.getCode());
        return toResponse(voucher);
    }

    @Override
    @Transactional
    public VoucherResponse updateVoucher(Long voucherId, VoucherUpdateRequest request) {
        Voucher voucher = findVoucherOrThrow(voucherId);

        if (request.getDescription() != null)
            voucher.setDescription(request.getDescription());
        if (request.getMinOrderAmount() != null)
            voucher.setMinOrderAmount(request.getMinOrderAmount());
        if (request.getMaxDiscountAmount() != null)
            voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getUsageLimit() != null)
            voucher.setUsageLimit(request.getUsageLimit());
        if (request.getUsageLimitPerUser() != null)
            voucher.setUsageLimitPerUser(request.getUsageLimitPerUser());
        if (request.getStatus() != null)
            voucher.setStatus(request.getStatus());
        if (request.getStartDate() != null)
            voucher.setStartDate(request.getStartDate());
        if (request.getEndDate() != null)
            voucher.setEndDate(request.getEndDate());

        if (voucher.getStartDate() != null && voucher.getEndDate() != null
                && voucher.getStartDate().isAfter(voucher.getEndDate())) {
            throw new IllegalArgumentException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        voucher.setUpdatedAt(LocalDateTime.now());
        voucher = voucherRepository.save(voucher);
        log.info("Voucher updated: id={}", voucherId);
        return toResponse(voucher);
    }

    @Override
    @Transactional
    public void deleteVoucher(Long voucherId) {
        Voucher voucher = findVoucherOrThrow(voucherId);
        if (voucher.getUsedCount() > 0) {
            // Da co nguoi dung: chi deactivate, khong xoa cung
            voucher.setStatus(VoucherStatus.INACTIVE);
            voucher.setUpdatedAt(LocalDateTime.now());
            voucherRepository.save(voucher);
            log.info("Voucher deactivated (has usages): id={}", voucherId);
        } else {
            voucherRepository.delete(voucher);
            log.info("Voucher deleted: id={}", voucherId);
        }
    }

    @Override
    public Page<VoucherResponse> getVouchers(String statusStr, String code, Pageable pageable) {
        VoucherStatus status = null;
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                status = VoucherStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + statusStr);
            }
        }
        return voucherRepository
                .findAllWithFilters(status, code, pageable)
                .map(this::toResponse);
    }


    @Override
    public List<VoucherResponse> getActiveVouchers() {
        return voucherRepository.findAllActive(LocalDateTime.now())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VoucherResponse getVoucherByCode(String code) {
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy voucher với mã: " + code));
        return toResponse(voucher);
    }

    @Override
    @Transactional
    public ApplyVoucherResponse applyVoucher(ApplyVoucherRequest request, User currentUser) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy booking #" + request.getBookingId()));

        // Kiem tra booking thuoc ve user hien tai (tru Admin/Manager)
        boolean isOwner = booking.getUser() != null
                && booking.getUser().getUserId().equals(currentUser.getUserId());
        boolean isStaff = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_MANAGER"));
        if (!isOwner && !isStaff) {
            throw new IllegalStateException("Bạn không có quyền áp dụng voucher cho booking này");
        }

        // Chi cho phep ap dung voucher khi booking chua thanh toan / huy
        if (booking.getStatus() != BookingStatus.PENDING
                && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Chỉ có thể áp dụng voucher cho booking đang PENDING hoặc CONFIRMED");
        }

        // Kiem tra booking da co voucher chua
        if (booking.getVoucher() != null) {
            throw new IllegalStateException(
                    "Booking này đã áp dụng voucher '" + booking.getVoucher().getCode()
                            + "'. Hãy hủy voucher hiện tại trước.");
        }

        Voucher voucher = voucherRepository.findByCodeIgnoreCase(request.getVoucherCode())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy voucher: " + request.getVoucherCode()));

        validateVoucher(voucher, currentUser);

        // Tinh tong gia tri don hang
        BigDecimal orderAmount = calcOrderAmount(booking);

        if (orderAmount.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new IllegalStateException(
                    "Đơn hàng tối thiểu " + voucher.getMinOrderAmount()
                            + " VND để áp dụng voucher này (hiện tại: " + orderAmount + " VND)");
        }

        // Tinh tien giam
        BigDecimal discountAmount = calcDiscount(voucher, orderAmount);

        // Cap nhat booking
        booking.setVoucher(voucher);
        booking.setDiscountAmount(discountAmount);
        bookingRepository.save(booking);

        // Luu usage
        VoucherUsage usage = VoucherUsage.builder()
                .voucher(voucher)
                .booking(booking)
                .user(currentUser)
                .discountAmount(discountAmount)
                .build();
        voucherUsageRepository.save(usage);

        // Tang luot da dung (atomic - tranh race condition)
        int updated = voucherRepository.incrementUsedCountIfAvailable(
                voucher.getVoucherId(), LocalDateTime.now());
        if (updated == 0) {
            throw new IllegalStateException(
                    "Voucher '" + voucher.getCode() + "' đã hết lượt sử dụng");
        }

        log.info("Voucher applied: code={}, bookingId={}, discount={}",
                voucher.getCode(), booking.getBookingId(), discountAmount);

        return ApplyVoucherResponse.builder()
                .bookingId(booking.getBookingId())
                .voucherCode(voucher.getCode())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .originalAmount(orderAmount)
                .discountAmount(discountAmount)
                .finalAmount(orderAmount.subtract(discountAmount))
                .build();
    }

    @Override
    @Transactional
    public void removeVoucher(Long bookingId, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy booking #" + bookingId));

        boolean isOwner = booking.getUser() != null
                && booking.getUser().getUserId().equals(currentUser.getUserId());
        boolean isStaff = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_MANAGER"));
        if (!isOwner && !isStaff) {
            throw new IllegalStateException("Bạn không có quyền hủy voucher cho booking này");
        }

        // Chi cho phep huy voucher khi booking chua check-in / hoan tat / huy
        BookingStatus status = booking.getStatus();
        if (status != BookingStatus.PENDING && status != BookingStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Không thể hủy voucher khỏi booking ở trạng thái " + status);
        }

        if (booking.getVoucher() == null) {
            throw new IllegalStateException("Booking này chưa áp dụng voucher nào");
        }

        Voucher voucher = booking.getVoucher();

        // Xoa usage record
        voucherUsageRepository.findByBooking_BookingId(bookingId)
                .ifPresent(voucherUsageRepository::delete);

        // Giam luot da dung (atomic)
        voucherRepository.decrementUsedCount(voucher.getVoucherId(), LocalDateTime.now());

        // Reset booking
        booking.setVoucher(null);
        booking.setDiscountAmount(BigDecimal.ZERO);
        bookingRepository.save(booking);

        log.info("Voucher removed: code={}, bookingId={}", voucher.getCode(), bookingId);
    }

    // ──────────────────────────── HELPERS ───────────────────────────────────

    private void validateVoucher(Voucher voucher, User user) {
        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new IllegalStateException("Voucher '" + voucher.getCode() + "' không còn hoạt động");
        }

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            throw new IllegalStateException(
                    "Voucher '" + voucher.getCode() + "' chưa đến thời gian áp dụng");
        }
        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            throw new IllegalStateException("Voucher '" + voucher.getCode() + "' đã hết hạn");
        }

        if (voucher.getUsageLimit() != null
                && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new IllegalStateException(
                    "Voucher '" + voucher.getCode() + "' đã hết lượt sử dụng");
        }

        int userUsageCount = voucherUsageRepository
                .countByVoucher_VoucherIdAndUser_UserId(voucher.getVoucherId(), user.getUserId());
        if (userUsageCount >= voucher.getUsageLimitPerUser()) {
            throw new IllegalStateException(
                    "Bạn đã sử dụng voucher '" + voucher.getCode() + "' tối đa "
                            + voucher.getUsageLimitPerUser() + " lần");
        }
    }

    private BigDecimal calcOrderAmount(Booking booking) {
        BigDecimal roomTotal = booking.getRoomPriceSnapshot()
                .multiply(BigDecimal.valueOf(booking.getTotalNights()));

        BigDecimal serviceTotal = booking.getBookingServices().stream()
                .map(bs -> bs.getSubtotal() != null ? bs.getSubtotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return roomTotal.add(serviceTotal);
    }

    private BigDecimal calcDiscount(Voucher voucher, BigDecimal orderAmount) {
        BigDecimal discount;
        if (voucher.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderAmount
                    .multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);

            if (voucher.getMaxDiscountAmount() != null
                    && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else {
            discount = voucher.getDiscountValue();
        }

        // Khong giam qua gia tri don hang
        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }
        return discount;
    }

    private Voucher findVoucherOrThrow(Long voucherId) {
        return voucherRepository.findById(voucherId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy voucher với id=" + voucherId));
    }

    private VoucherResponse toResponse(Voucher v) {
        return VoucherResponse.builder()
                .voucherId(v.getVoucherId())
                .code(v.getCode())
                .description(v.getDescription())
                .discountType(v.getDiscountType())
                .discountValue(v.getDiscountValue())
                .minOrderAmount(v.getMinOrderAmount())
                .maxDiscountAmount(v.getMaxDiscountAmount())
                .usageLimit(v.getUsageLimit())
                .usedCount(v.getUsedCount())
                .usageLimitPerUser(v.getUsageLimitPerUser())
                .status(v.getStatus())
                .startDate(v.getStartDate())
                .endDate(v.getEndDate())
                .createdAt(v.getCreatedAt())
                .build();
    }
}
