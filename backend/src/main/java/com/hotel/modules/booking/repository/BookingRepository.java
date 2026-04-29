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

    @Query("SELECT b FROM Booking b WHERE b.room.roomId = :roomId")
    List<Booking> findByRoomId(@Param("roomId") Long roomId);


    // Kiểm tra trùng lịch
    @Query("""
    SELECT COUNT(b) > 0 FROM Booking b
    WHERE b.room.roomId = :roomId
    AND b.status NOT IN ('CANCELLED', 'REFUNDED')
    AND b.checkInDate < :checkOut
    AND b.checkOutDate > :checkIn
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
    AND b.checkInDate < :checkOut
    AND b.checkOutDate > :checkIn
""")
    List<Long> findOccupiedRoomIds(
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    @Query("""
    SELECT b FROM Booking b
    WHERE b.status = 'PENDING'
    AND b.expiresAt < :now
""")
    List<Booking> findExpiredPendingBookings(@Param("now") LocalDateTime now);

}

