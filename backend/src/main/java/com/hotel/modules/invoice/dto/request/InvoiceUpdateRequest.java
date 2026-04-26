package com.hotel.modules.invoice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InvoiceUpdateRequest {
    @NotNull(message = "Id không được để trống")
    private Long id;
    private String notes;
    private String pdfUrl;
}
