package com.hotel.modules.booking.entity;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.invoice.entity.Invoice;
import com.hotel.modules.invoice.entity.Review;
import com.hotel.modules.room.entity.Room;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "Bookings")
public class Booking {
    // "Đây là Primary Key, tự động tăng"
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "booking_code", nullable = false, length = 20)
    private String bookingCode; // booking_code — Mã hiển thị cho khách: HB20250801-0001

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // check_in_date DATE NOT NULL
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate; // check_in_date — Ngày dự kiến (khách chọn)

    // check_out_date DATE NOT NULL
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate; // check_out_date — Ngày dự kiến (khách chọn)

    @Column(name = "actual_checkin")
    private LocalDateTime actualCheckIn; // actual_checkin — Giờ thực tế staff bấm check-in

    @Column(name = "actual_checkout")
    private LocalDateTime actualCheckout; // actual_checkout — Giờ thực tế staff bấm check-out

    // num_guests TINYINT NOT NULL DEFAULT 1
    @Column(name = "num_guests", nullable = false)
    private Byte numGuests = 1; // num_guests — Số khách

    // special_request NVARCHAR(500) NULL
    @Column(name = "special_request", length = 500)
    private String specialRequest; // special_request — Yêu cầu đặc biệt ("phòng tầng cao", "không hút thuốc"...)

    @Column(name = "room_price_snapshot", nullable = false, precision = 18, scale = 2)
    private BigDecimal roomPriceSnapshot; // room_price_snapshot — Giá phòng/đêm lúc đặt (snapshot)

    @Column(name = "total_nights", nullable = false)
    private Short totalNights; // total_nights — Số đêm

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDING; // status — PENDING | CONFIRMED | CHECKED_IN | CHECKED_OUT |
                                                          // CANCELLED | REFUNDED

    @Column(name = "expires_at")
    private LocalDateTime expiresAt; // expires_at — Hết hạn PENDING (created_at + 15 phút)

    @Column(name = "version", nullable = false)
    private Integer version = 0; // version — Optimistic Locking, Spring tự tăng khi UPDATE

    // created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Review review;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Invoice invoice;
}
