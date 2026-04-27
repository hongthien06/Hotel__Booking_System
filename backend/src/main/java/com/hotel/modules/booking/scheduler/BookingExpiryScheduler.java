package com.hotel.modules.booking.scheduler;

import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.entity.BookingStatus;
import com.hotel.modules.booking.repository.bookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingExpiryScheduler {

    private final bookingRepository bookingRepository;

    /**
     * Chạy mỗi 2 phút: tự động hủy các booking PENDING đã hết hạn (expiresAt < now).
     * Giúp phòng được trả về trạng thái AVAILABLE để người khác đặt được.
     */
    @Scheduled(fixedDelay = 120_000) // 2 phút một lần
    @Transactional
    public void cancelExpiredPendingBookings() {
        List<Booking> expired = bookingRepository.findExpiredPendingBookings(LocalDateTime.now());

        if (expired.isEmpty()) return;

        log.info("[Scheduler] Tìm thấy {} booking PENDING hết hạn, đang hủy...", expired.size());

        for (Booking booking : expired) {
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setUpdatedAt(LocalDateTime.now());
            log.info("[Scheduler] Hủy booking #{} - phòng {} - hết hạn lúc {}",
                    booking.getBookingId(),
                    booking.getRoom().getRoomNumber(),
                    booking.getExpiresAt());
        }

        bookingRepository.saveAll(expired);
        log.info("[Scheduler] Đã hủy {} booking hết hạn.", expired.size());
    }
}
