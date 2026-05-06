package com.hotel.modules.voucher.dto.response;

import com.hotel.modules.voucher.entity.DiscountType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ApplyVoucherResponse {
    private Long bookingId;
    private String voucherCode;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal originalAmount;   // Tong truoc giam
    private BigDecimal discountAmount;   // So tien duoc giam
    private BigDecimal finalAmount;      // Tong sau giam
}
