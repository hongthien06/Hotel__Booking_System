package com.hotel.modules.booking_services.repository;

import com.hotel.modules.booking_services.entity.BookingService;
import com.hotel.modules.booking_services.entity.BookingServiceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingServiceRepository extends JpaRepository<BookingService, BookingServiceId> {
    @Query("SELECT bs FROM BookingService bs " +
            "JOIN FETCH bs.extraService " +
            "WHERE bs.id.bookingId = :bookingId")
    List<BookingService> findByIdBookingId(Long bookingId);
}
