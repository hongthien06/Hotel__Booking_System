// booking/dto/BookingDTO.java
package com.hotel.modules.booking.dto;

import com.hotel.modules.booking.entity.BookingStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.hotel.modules.booking_services.dto.BookingServiceResponse;

@Getter
@Setter
public class BookingDTO {

    // ── Thông tin Booking ──────────────────────────────
    private Long bookingId;
    private String bookingCode;
    private Byte numGuests;
    private String specialRequest;
    private BigDecimal roomPriceSnapshot;
    private Short totalNights;
    private BookingStatus status;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private LocalDateTime actualCheckIn;
    private LocalDateTime actualCheckout;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private BigDecimal totalAmount;    // Tính tổng tiền booking (chưa tính ExtraService)
    private BigDecimal serviceTotal;   // Tổng tiền dịch vụ
    private BigDecimal grandTotal;     // Tổng cộng (Room + Service)
    private List<BookingServiceResponse> bookingServices;

    // ── Thông tin User (lấy từ booking.getUser()) ─────
    private Long userId;
    private String userName;
    private String userEmail;

    // ── Thông tin Room (lấy từ booking.getRoom()) ─────
    private Long roomId;
    private String roomNumber;
    private String roomTypeName;  // ← Đây là field gây lỗi lazy trước đó
}