package com.hotel.modules.voucher.service;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.booking.entity.Booking;
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
import java.math.RoundingMode;
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
                && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
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
        if (request.getDescription() != null)    voucher.setDescription(request.getDescription());
        if (request.getMinOrderAmount() != null)  voucher.setMinOrderAmount(request.getMinOrderAmount());
        if (request.getMaxDiscountAmount() != null) voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getUsageLimit() != null)      voucher.setUsageLimit(request.getUsageLimit());
        if (request.getUsageLimitPerUser() != null) voucher.setUsageLimitPerUser(request.getUsageLimitPerUser());
        if (request.getStatus() != null)          voucher.setStatus(request.getStatus());
        if (request.getStartDate() != null)       voucher.setStartDate(request.getStartDate());
        if (request.getEndDate() != null)         voucher.setEndDate(request.getEndDate());
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
            voucher.setStatus(VoucherStatus.INACTIVE);
            voucher.setUpdatedAt(LocalDateTime.now());
            voucherRepository.save(voucher);
        } else {
            voucherRepository.delete(voucher);
        }
        log.info("Voucher deleted/deactivated: id={}", voucherId);
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
        return voucherRepository.findAllWithFilters(status, code, pageable).map(this::toResponse);
    }

    @Override
    public List<VoucherResponse> getActiveVouchers() {
        return voucherRepository.findAllActive(LocalDateTime.now())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public VoucherResponse getVoucherByCode(String code) {
        return toResponse(voucherRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy voucher với mã: " + code)));
    }

    @Override
    @Transactional
    public ApplyVoucherResponse applyVoucher(ApplyVoucherRequest request, User currentUser) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy booking #" + request.getBookingId()));
        if (booking.getUser() == null || !booking.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new IllegalStateException("Bạn không có quyền áp voucher cho booking này");
        }
        if (voucherUsageRepository.existsByBooking_BookingId(booking.getBookingId())) {
            throw new IllegalStateException("Booking này đã áp dụng voucher");
        }

        Voucher voucher = voucherRepository.findByCodeIgnoreCase(request.getVoucherCode())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy voucher với mã: " + request.getVoucherCode()));
        validateVoucher(voucher, currentUser);

        BigDecimal subtotal = calculateSubtotal(booking);
        BigDecimal taxAmount = subtotal.multiply(new BigDecimal("10.00"))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal baseDiscount = getAutomaticDiscount(booking);
        BigDecimal originalAmount = subtotal.add(taxAmount).subtract(baseDiscount).max(BigDecimal.ZERO);
        if (originalAmount.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new IllegalStateException("Đơn hàng chưa đạt giá trị tối thiểu để dùng voucher");
        }

        BigDecimal discountAmount = calculateVoucherDiscount(voucher, originalAmount);
        if (discountAmount.compareTo(originalAmount) > 0) {
            discountAmount = originalAmount;
        }

        VoucherUsage usage = VoucherUsage.builder()
                .voucher(voucher)
                .booking(booking)
                .user(currentUser)
                .discountAmount(discountAmount)
                .build();
        voucherUsageRepository.save(usage);

        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucher.setUpdatedAt(LocalDateTime.now());
        voucherRepository.save(voucher);

        booking.setDiscountAmount(baseDiscount.add(discountAmount));
        bookingRepository.save(booking);

        return ApplyVoucherResponse.builder()
                .bookingId(booking.getBookingId())
                .voucherCode(voucher.getCode())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .originalAmount(originalAmount)
                .discountAmount(discountAmount)
                .finalAmount(originalAmount.subtract(discountAmount).max(BigDecimal.ZERO))
                .build();
    }

    @Override
    @Transactional
    public void removeVoucher(Long bookingId, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy booking #" + bookingId));
        if (booking.getUser() == null || !booking.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new IllegalStateException("Bạn không có quyền gỡ voucher của booking này");
        }
        VoucherUsage usage = voucherUsageRepository.findByBooking_BookingId(bookingId)
                .orElse(null);
        if (usage == null) {
            booking.setDiscountAmount(getAutomaticDiscount(booking));
            bookingRepository.save(booking);
            return;
        }
        Voucher voucher = usage.getVoucher();
        voucher.setUsedCount(Math.max(0, voucher.getUsedCount() - 1));
        voucher.setUpdatedAt(LocalDateTime.now());
        voucherRepository.save(voucher);
        voucherUsageRepository.delete(usage);

        booking.setDiscountAmount(getAutomaticDiscount(booking));
        bookingRepository.save(booking);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Voucher findVoucherOrThrow(Long voucherId) {
        return voucherRepository.findById(voucherId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy voucher với id=" + voucherId));
    }

    private void validateVoucher(Voucher voucher, User user) {
        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new IllegalStateException("Voucher không còn hoạt động");
        }
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            throw new IllegalStateException("Voucher chưa đến thời gian sử dụng");
        }
        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            throw new IllegalStateException("Voucher đã hết hạn");
        }
        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new IllegalStateException("Voucher đã hết lượt sử dụng");
        }
        int usedByUser = voucherUsageRepository
                .countByVoucher_VoucherIdAndUser_UserId(voucher.getVoucherId(), user.getUserId());
        if (usedByUser >= voucher.getUsageLimitPerUser()) {
            throw new IllegalStateException("Bạn đã dùng hết lượt voucher này");
        }
    }

    private BigDecimal calculateVoucherDiscount(Voucher voucher, BigDecimal amount) {
        BigDecimal discount;
        if (voucher.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = amount.multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (voucher.getMaxDiscountAmount() != null
                    && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else {
            discount = voucher.getDiscountValue();
        }
        return discount.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateSubtotal(Booking booking) {
        BigDecimal roomTotal;
        if (booking.getBookingRooms() != null && !booking.getBookingRooms().isEmpty()) {
            roomTotal = booking.getBookingRooms().stream()
                    .map(br -> br.getRoomPriceSnapshot()
                            .multiply(BigDecimal.valueOf(booking.getTotalNights())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } else {
            roomTotal = booking.getRoomPriceSnapshot()
                    .multiply(BigDecimal.valueOf(booking.getTotalNights()));
        }
        BigDecimal serviceTotal = BigDecimal.ZERO;
        if (booking.getBookingServices() != null) {
            serviceTotal = booking.getBookingServices().stream()
                    .map(bs -> bs.getSubtotal() != null ? bs.getSubtotal()
                            : (bs.getUnitPriceSnap() != null && bs.getQuantity() != null
                                    ? bs.getUnitPriceSnap().multiply(BigDecimal.valueOf(bs.getQuantity()))
                                    : BigDecimal.ZERO))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        return roomTotal.add(serviceTotal);
    }

    private BigDecimal getAutomaticDiscount(Booking booking) {
        BigDecimal membership = booking.getMembershipDiscountAmt() != null
                ? booking.getMembershipDiscountAmt() : BigDecimal.ZERO;
        BigDecimal group = booking.getGroupDiscountAmt() != null
                ? booking.getGroupDiscountAmt() : BigDecimal.ZERO;
        return membership.add(group);
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
