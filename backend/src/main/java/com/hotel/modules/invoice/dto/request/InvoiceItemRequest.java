package com.hotel.modules.invoice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InvoiceItemRequest {
    @NotBlank(message = "Loại item không được để trống")
    private String itemType; // ROOM, SERVICE, v.v.

    @NotBlank(message = "Mô tả không được để trống")
    private String description;

    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Short quantity = 1;

    @NotNull(message = "Đơn giá không được để trống")
    private BigDecimal unitPrice;
}