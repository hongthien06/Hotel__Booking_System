package com.hotel.modules.booking.repository;


import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b WHERE b.user.userId = :userId")
    List<Booking> findByUserId(@Param("userId") Long userId);

    @Query("SELECT b FROM Booking b WHERE b.user.userId = :userId " +
           "AND (:checkIn IS NULL OR b.checkInDate >= :checkIn) " +
           "AND (:checkOut IS NULL OR b.checkOutDate <= :checkOut) " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findMyBookings(
            @Param("userId") Long userId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );


    List<Booking> findByStatus(BookingStatus status);

    @Query("""
    SELECT DISTINCT b FROM Booking b
    LEFT JOIN b.bookingRooms br
    WHERE (b.room.roomId = :roomId OR br.room.roomId = :roomId)
    AND b.status NOT IN ('CANCELLED', 'REFUNDED')
""")
    List<Booking> findActiveBookingsByRoomId(@Param("roomId") Long roomId);

    // Kiểm tra trùng lịch
    @Query("""
    SELECT COUNT(b) > 0 FROM Booking b
    WHERE b.room.roomId = :roomId
    AND b.status NOT IN ('CANCELLED', 'REFUNDED')
        AND (
            (b.checkInDate < :checkOut AND b.checkOutDate > :checkIn)
            OR (b.checkInDate = b.checkOutDate AND b.checkInDate = :checkIn)
        )
""")
    boolean existsConflictBooking(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    // Tìm id các phòng bị trùng trong khoảng thời gian khác chọn
    @Query("""
    SELECT b.room.roomId FROM Booking b
    WHERE b.status NOT IN ('CANCELLED', 'REFUNDED')
        AND (
            (b.checkInDate < :checkOut AND b.checkOutDate > :checkIn)
            OR (b.checkInDate = b.checkOutDate AND b.checkInDate = :checkIn)
        )
""")
    List<Long> findOccupiedRoomIds(
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    @Query("""
    SELECT DISTINCT b FROM Booking b
    LEFT JOIN FETCH b.bookingRooms br
    LEFT JOIN FETCH br.room r
    WHERE b.status NOT IN ('CANCELLED', 'REFUNDED')
        AND (
            (b.checkInDate < :checkOut AND b.checkOutDate > :checkIn)
            OR (b.checkInDate = b.checkOutDate AND b.checkInDate = :checkIn)
        )
""")
    List<Booking> findActiveBookingsInRange(
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    @Query("""
    SELECT b FROM Booking b
    WHERE b.status = 'PENDING'
    AND b.expiresAt < :now
""")
    List<Booking> findExpiredPendingBookings(@Param("now") LocalDateTime now);

    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByMergedIntoBooking_BookingId(Long bookingId);

    // ── Dashboard Queries ────────────────────
    @Query("SELECT b.status, COUNT(b) FROM Booking b GROUP BY b.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt >= :start AND b.createdAt < :end")
    long countByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status AND b.checkInDate = :date")
    long countByStatusAndCheckInDate(@Param("status") BookingStatus status, @Param("date") LocalDate date);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status AND b.checkOutDate = :date")
    long countByStatusAndCheckOutDate(@Param("status") BookingStatus status, @Param("date") LocalDate date);
}
