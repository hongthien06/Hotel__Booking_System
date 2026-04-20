package com.hotel.modules.booking.service;

import com.hotel.modules.booking.dto.BookingDTO;
import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.entity.BookingStatus;
import com.hotel.modules.booking.repository.bookingRepository;
import com.hotel.modules.room.entity.Room;
import com.hotel.modules.room.entity.enums.RoomStatus;
import com.hotel.modules.room.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {
    @Autowired
    private final bookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public BookingService(bookingRepository bookingRepository, RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
    }

    public void checkIn(Long bookingId) {

        // 1. Lấy booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));

        // 2. Check trạng thái
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking không ở trạng thái check-in được");
        }

        // 3. Check thời gian (optional nhưng nên có)
        if (LocalDateTime.now().isBefore(booking.getCheckInDate().atStartOfDay())) {
            throw new RuntimeException("Chưa đến thời gian check-in");
        }

        // 4. Update booking
        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setActualCheckIn(LocalDateTime.now());

        // 5. Update room
        Room room = booking.getRoom();
        room.setStatus(RoomStatus.OCCUPIED);

        // 6. Save
        bookingRepository.save(booking);
        roomRepository.save(room);
    }

    @Transactional(readOnly = true)  // ← Thêm dòng này
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // Tách ra method riêng cho gọn
    private BookingDTO toDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();

        // Booking fields
        dto.setBookingId(booking.getBookingId());
        dto.setBookingCode(booking.getBookingCode());
        dto.setNumGuests(booking.getNumGuests());
        dto.setSpecialRequest(booking.getSpecialRequest());
        dto.setRoomPriceSnapshot(booking.getRoomPriceSnapshot());
        dto.setTotalNights(booking.getTotalNights());
        dto.setStatus(booking.getStatus());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setActualCheckIn(booking.getActualCheckIn());
        dto.setActualCheckout(booking.getActualCheckout());
        dto.setExpiresAt(booking.getExpiresAt());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());

        // User fields
        if (booking.getUser() != null) {
            dto.setUserId(booking.getUser().getUserId());
            dto.setUserName(booking.getUser().getFullName());
            dto.setUserEmail(booking.getUser().getEmail());
        }

        // Room fields
        if (booking.getRoom() != null) {
            dto.setRoomId(booking.getRoom().getRoomId());
            dto.setRoomNumber(booking.getRoom().getRoomNumber());

            // Lấy RoomType an toàn (tránh null)
            if (booking.getRoom().getRoomType() != null) {
                dto.setRoomTypeName(booking.getRoom().getRoomType().getTypeName());
            }
        }

        return dto;
    }
//    public void checkOut(Long bookingId);
//    public void createBooking(...);
//    public void cancelBooking(...);

}
