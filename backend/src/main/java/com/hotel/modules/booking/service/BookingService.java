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

    private final bookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public BookingService(bookingRepository bookingRepository, RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    private BookingDTO toDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();

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

        if (booking.getUser() != null) {
            dto.setUserId(booking.getUser().getUserId());
            dto.setUserName(booking.getUser().getFullName());
            dto.setUserEmail(booking.getUser().getEmail());
        }

        if (booking.getRoom() != null) {
            dto.setRoomId(booking.getRoom().getRoomId());
            dto.setRoomNumber(booking.getRoom().getRoomNumber());
            if (booking.getRoom().getRoomType() != null) {
                dto.setRoomTypeName(booking.getRoom().getRoomType().getTypeName());
            }
        }

        return dto;
    }

    // CHECK IN:
    @Transactional
    public BookingDTO checkIn(Long bookingId) {

        // 1. Lấy booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));

        // 2. Check trạng thái
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking không ở trạng thái check-in được");
        }

        // 3. Check thời gian
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

        // 7. Trả về DTO
        return toDTO(booking);
    }

    // CHECK IN list ID
    @Transactional(readOnly = true)
    public List<Long> getCheckedInRoomIds() {
        return bookingRepository.findAll()
                .stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_IN)
                .map(b -> b.getRoom().getRoomId())
                .toList();
    }

    // CHECK OUT:
    @Transactional
    public BookingDTO checkOut(Long bookingId) {

        // 1. Lấy booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));

        // 2. Check trạng thái
        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new RuntimeException("Booking không ở trạng thái check-out được");
        }

        // 3. Update booking
        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking.setActualCheckout(LocalDateTime.now());

        // 4. Update room → trả về AVAILABLE
        Room room = booking.getRoom();
        room.setStatus(RoomStatus.AVAILABLE);

        // 5. Save
        bookingRepository.save(booking);
        roomRepository.save(room);

        // 6. Trả về DTO
        return toDTO(booking);
    }

    // CHECK OUT list ID
    @Transactional(readOnly = true)
    public List<Long> getCheckedOutRoomIds() {
        return bookingRepository.findAll()
                .stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_OUT)
                .map(b -> b.getRoom().getRoomId())
                .toList();
    }




    public void checkAvailableRoom() {

    }



}
