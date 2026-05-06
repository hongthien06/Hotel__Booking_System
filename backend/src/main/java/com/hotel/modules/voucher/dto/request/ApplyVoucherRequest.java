package com.hotel.modules.voucher.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplyVoucherRequest {

    @NotNull(message = "BookingId không được để trống")
    private Long bookingId;

    @NotBlank(message = "Mã voucher không được để trống")
    private String voucherCode;
}
