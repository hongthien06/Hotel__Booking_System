package com.hotel.modules.invoice.dto.request;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InvoiceUpdateRequest {
    @NotNull(message = "Id không được để trống")
    private Long id;
    private String notes;
    private String pdfUrl;
}
