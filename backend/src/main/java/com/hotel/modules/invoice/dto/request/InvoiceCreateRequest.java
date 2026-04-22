package com.hotel.modules.invoice.dto.request;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

@Data
public class InvoiceCreateRequest {
    @NotNull(message = "Booking ID không được để trống")
    private Long bookingId;

    @NotNull(message = "Payment ID không được để trống")
    private Long paymentId;

    private BigDecimal discountAmount = BigDecimal.ZERO;
    private String notes;

    @NotEmpty(message = "Hóa đơn phải có ít nhất 1 chi tiết")
    private List<InvoiceItemRequest> items;
}
