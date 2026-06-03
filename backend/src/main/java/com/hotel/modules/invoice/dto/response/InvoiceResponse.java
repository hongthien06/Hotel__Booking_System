package com.hotel.modules.invoice.dto.response;

import lombok.Builder;
import lombok.Data;

import com.hotel.modules.booking.dto.BookingRoomDTO;

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
    private String bookingCode;

    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Short totalNight;
    private Byte numGuests;
    private Integer roomCount;
    private String address;
    private List<BookingRoomDTO> rooms;

    private String membershipTierName;   // hạng thành viên áp dụng
    private BigDecimal membershipDiscountPct;
    private Boolean isFirstBookingDiscount;
    private BigDecimal holidayMultiplier;
    private String holidayPeriodName;
    private BigDecimal groupDiscountPct;

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
