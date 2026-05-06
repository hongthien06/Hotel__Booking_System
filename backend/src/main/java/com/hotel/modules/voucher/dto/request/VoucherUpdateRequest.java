package com.hotel.modules.voucher.dto.request;

import com.hotel.modules.voucher.entity.VoucherStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VoucherUpdateRequest {

    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    private String description;

    @DecimalMin(value = "0", message = "Giá trị đơn hàng tối thiểu không được âm")
    private BigDecimal minOrderAmount;

    @DecimalMin(value = "0.01", message = "Mức giảm tối đa phải lớn hơn 0")
    private BigDecimal maxDiscountAmount;

    @Min(value = 1, message = "Số lần sử dụng tối thiểu là 1")
    private Integer usageLimit;

    @Min(value = 1, message = "Giới hạn mỗi người dùng tối thiểu là 1")
    private Integer usageLimitPerUser;

    private VoucherStatus status;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
