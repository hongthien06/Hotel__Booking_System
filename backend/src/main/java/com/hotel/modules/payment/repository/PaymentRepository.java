package com.hotel.modules.payment.repository;

import com.hotel.modules.payment.entity.Payment;
import com.hotel.modules.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTransactionId(String transactionId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.booking b JOIN FETCH b.user WHERE p.booking.bookingCode = :bookingCode")
    Optional<Payment> findByBookingCode(@Param("bookingCode") String bookingCode);

    @Query("SELECT p FROM Payment p JOIN FETCH p.booking b JOIN FETCH b.user WHERE b.bookingId = :bookingId")
    Optional<Payment> findByBookingId(@Param("bookingId") Long bookingId);

    // ── Dashboard Queries ────────────────────
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status AND p.paidAt >= :start AND p.paidAt < :end")
    BigDecimal sumRevenueByDateRange(@Param("status") PaymentStatus status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT CAST(p.paidAt AS date), COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = :status AND p.paidAt >= :start AND p.paidAt < :end GROUP BY CAST(p.paidAt AS date) ORDER BY CAST(p.paidAt AS date)")
    List<Object[]> findDailyRevenue(@Param("status") PaymentStatus status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT b.room.roomType.typeName, COALESCE(SUM(p.amount), 0) FROM Payment p JOIN p.booking b WHERE p.status = :status AND p.paidAt >= :start AND p.paidAt < :end GROUP BY b.room.roomType.typeName")
    List<Object[]> findRevenueByRoomType(@Param("status") PaymentStatus status, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
