package com.hotel.modules.voucher.dto.request;

import com.hotel.modules.voucher.entity.DiscountType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VoucherCreateRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    @Size(max = 50, message = "Mã voucher tối đa 50 ký tự")
    @Pattern(regexp = "^[A-Z0-9_\\-]+$", message = "Mã voucher chỉ gồm chữ IN HOA, số, _ và -")
    private String code;

    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    private String description;

    @NotNull(message = "Loại giảm giá không được để trống")
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm không được để trống")
    @DecimalMin(value = "0.01", message = "Giá trị giảm phải lớn hơn 0")
    private BigDecimal discountValue;

    // Gia tri don hang toi thieu (mac dinh 0)
    @DecimalMin(value = "0", message = "Giá trị đơn hàng tối thiểu không được âm")
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    // Chi ap dung khi discountType = PERCENTAGE
    @DecimalMin(value = "0.01", message = "Mức giảm tối đa phải lớn hơn 0")
    private BigDecimal maxDiscountAmount;

    // null = khong gioi han
    @Min(value = 1, message = "Số lần sử dụng tối thiểu là 1")
    private Integer usageLimit;

    @Min(value = 1, message = "Giới hạn mỗi người dùng tối thiểu là 1")
    private Integer usageLimitPerUser = 1;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
