package com.hotel.modules.voucher.service;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.voucher.dto.request.ApplyVoucherRequest;
import com.hotel.modules.voucher.dto.request.VoucherCreateRequest;
import com.hotel.modules.voucher.dto.request.VoucherUpdateRequest;
import com.hotel.modules.voucher.dto.response.ApplyVoucherResponse;
import com.hotel.modules.voucher.dto.response.VoucherResponse;
import com.hotel.modules.voucher.entity.DiscountType;
import com.hotel.modules.voucher.entity.Voucher;
import com.hotel.modules.voucher.entity.VoucherStatus;
import com.hotel.modules.voucher.repository.VoucherRepository;
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
        throw new UnsupportedOperationException(
                "Hệ thống voucher đã được thay thế bởi hệ thống hạng thành viên. " +
                "Giảm giá được áp dụng tự động khi tạo booking.");
    }

    @Override
    @Transactional
    public void removeVoucher(Long bookingId, User currentUser) {
        throw new UnsupportedOperationException(
                "Hệ thống voucher đã được thay thế bởi hệ thống hạng thành viên.");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

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
