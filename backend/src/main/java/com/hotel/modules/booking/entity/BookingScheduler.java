package com.hotel.modules.booking.entity;

import com.hotel.modules.booking.repository.bookingRepository;
import com.hotel.modules.booking.service.BookingService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

import static com.hotel.modules.booking.entity.CancelActor.SYSTEM;

@Component
public class BookingScheduler {

    private final BookingService bookingService;
    private final bookingRepository bookingRepository;

    public BookingScheduler(BookingService bookingService,
                            bookingRepository bookingRepository) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
    }

    // Chạy mỗi 1 phút một lần
    @Scheduled(fixedRate = 60000)
    public void cancelExpiredBookings() {
        List<Booking> expiredBookings = bookingRepository
                .findExpiredPendingBookings(LocalDateTime.now());

        for (Booking booking : expiredBookings) {
            bookingService.cancelBooking(booking.getBookingId(), null, SYSTEM);
        }
    }
}
