package com.hotel.modules.invoice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class InvoiceResponse {

    private Long id;
    private Long bookingId;
    private Long paymentId;
    private String invoiceNumber;
    private String transactionId;
    private String bookingCode;

    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Short totalNight;
    private Byte numGuests;
    private String address;

    private BigDecimal subtotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;

    private String pdfUrl;
    private LocalDateTime issuedAt;
    private String notes;

    private List<InvoiceItemResponse> items;
}
