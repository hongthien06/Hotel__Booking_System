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
    private Byte numAdults;
    private Byte numChildren;
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
    private BigDecimal totalAmount;    // Tiền phòng (sau áp dụng holiday multiplier)
    private BigDecimal serviceTotal;   // Tổng tiền dịch vụ
    private BigDecimal grandTotal;     // Tổng cộng (Room + Service) trước giảm giá
    private BigDecimal discountAmount; // Tổng giảm giá (membership + group)
    private BigDecimal finalAmount;    // Thực trả = grandTotal - discountAmount
    private List<BookingRoomDTO> rooms;
    private List<BookingServiceResponse> bookingServices;

    // ── Price breakdown chi tiết ────────────────────────────────────────
    private BigDecimal membershipDiscountPct;
    private BigDecimal membershipDiscountAmt;
    private Boolean isFirstBookingDiscount;
    private BigDecimal holidayMultiplier;
    private String holidayPeriodName;    // tên kỳ lễ (nếu có)
    private BigDecimal groupDiscountPct;
    private BigDecimal groupDiscountAmt;
    private Integer guestCount;
    private String membershipTierName;   // hạng thành viên áp dụng

    // ── Thông tin User (lấy từ booking.getUser()) ─────
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;

    // ── Thông tin Room / Hotel ────────────────────────
    private Long roomId;
    private String roomNumber;
    private String roomTypeName;
    private String hotelName;
    private String hotelAddress;
}
