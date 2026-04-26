package com.hotel.modules.booking.service;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.auth.repository.UserRepository;
import com.hotel.modules.booking.dto.BookingDTO;
import com.hotel.modules.booking.dto.BookingRequest;
import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.entity.BookingStatus;
import com.hotel.modules.booking.entity.CancelActor;
import com.hotel.modules.booking.repository.bookingRepository;
import com.hotel.modules.room.dto.response.RoomResponse;
import com.hotel.modules.room.entity.Room;
import com.hotel.modules.room.entity.enums.RoomStatus;
import com.hotel.modules.room.repository.RoomRepository;
import com.hotel.modules.room.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    private final bookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public BookingService(bookingRepository bookingRepository, RoomRepository roomRepository,
            UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
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

        // Trong toDTO()
        if (booking.getRoomPriceSnapshot() != null && booking.getTotalNights() != null) {
            dto.setTotalAmount(
                    booking.getRoomPriceSnapshot()
                            .multiply(BigDecimal.valueOf(booking.getTotalNights())));
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

    @Transactional(readOnly = true) // Nó đây nha ĐA
    public List<Long> getOccupiedRoomIds(LocalDate checkIn, LocalDate checkOut) {
        return bookingRepository.findOccupiedRoomIds(checkIn, checkOut);
    }

    public void checkAvailableRoom() {

    }

    // Generate booking code: HB20260425-0001
    private String generateBookingCode(LocalDate checkIn) {
        String datePart = checkIn.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = bookingRepository.count() + 1;
        return String.format("HB%s-%04d", datePart, count);
    }

    // Tao Booking tu userId va Request
    @Transactional
    public BookingDTO createBooking(BookingRequest request, Long userId) {

        // 1. Kiểm tra thời gian checkIn < checkOut
        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            throw new RuntimeException("Ngày checkout phải sau ngày checkin");
        }

        // 2. Kiểm tra phòng AVAILABLE
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new RuntimeException("Phòng không khả dụng");
        }

        // 3. Kiểm tra trùng lịch (tránh race condition)
        List<Long> occupiedRoomIds = getOccupiedRoomIds(request.getCheckIn(), request.getCheckOut());
        if (occupiedRoomIds.contains(request.getRoomId())) {
            throw new RuntimeException("Phòng đã được đặt trong khoảng thời gian này");
        }

        // 4. Lấy user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 5. Tính toán
        short totalNights = (short) ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());

        // 6. Tạo booking
        Booking booking = new Booking();
        booking.setBookingCode(generateBookingCode(request.getCheckIn()));
        booking.setUser(user);
        booking.setRoom(room);
        booking.setCheckInDate(request.getCheckIn());
        booking.setCheckOutDate(request.getCheckOut());
        booking.setNumGuests(request.getNumGuests());
        booking.setSpecialRequest(request.getSpecialRequest());
        booking.setRoomPriceSnapshot(room.getPricePerNight());
        booking.setTotalNights(totalNights);
        booking.setStatus(BookingStatus.PENDING);
        booking.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        bookingRepository.save(booking);

        return toDTO(booking);
    }

    // Thao tac Cancel booking
    @Transactional
    public BookingDTO cancelBooking(Long bookingId, Long userId, CancelActor Actor) {

        // 1. Lấy booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));

        switch (Actor) {

            case USER -> {
                // Chỉ được hủy booking của chính mình
                if (!booking.getUser().getUserId().equals(userId)) {
                    throw new RuntimeException("Bạn không có quyền hủy booking này");
                }

                // Chỉ hủy được PENDING hoặc CONFIRMED
                if (booking.getStatus() != BookingStatus.PENDING
                        && booking.getStatus() != BookingStatus.CONFIRMED) {
                    throw new RuntimeException("Booking không thể hủy ở trạng thái hiện tại");
                }

                // Nếu CONFIRMED → kiểm tra có trước 24h không
                if (booking.getStatus() == BookingStatus.CONFIRMED) {
                    LocalDateTime deadline = booking.getCheckInDate()
                            .atStartOfDay()
                            .minusHours(24);

                    if (LocalDateTime.now().isBefore(deadline)) {
                        // Hủy trước 24h → hoàn tiền
                        booking.setStatus(BookingStatus.REFUNDED);
                    } else {
                        // Hủy sau 24h → không hoàn tiền
                        booking.setStatus(BookingStatus.CANCELLED);
                    }
                } else {
                    // PENDING → hủy bình thường
                    booking.setStatus(BookingStatus.CANCELLED);
                }
            }

            case ADMIN -> {
                // Admin hủy bất kì booking nào
                if (booking.getStatus() == BookingStatus.CHECKED_OUT) {
                    throw new RuntimeException("Không thể hủy booking đã check-out");
                }
                booking.setStatus(BookingStatus.CANCELLED);
            }

            case SYSTEM -> {
                // System chỉ hủy PENDING hết hạn hoặc thanh toán thất bại
                if (booking.getStatus() != BookingStatus.PENDING) {
                    throw new RuntimeException("System chỉ hủy được booking PENDING");
                }
                booking.setStatus(BookingStatus.CANCELLED);
            }

            default -> throw new RuntimeException("cancelledBy không hợp lệ");
        }

        // 2. Trả phòng về AVAILABLE nếu phòng đang bị giữ
        Room room = booking.getRoom();
        if (room.getStatus() == RoomStatus.OCCUPIED) {
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }

        // 3. Update thời gian
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        return toDTO(booking);
    }

    public Booking findById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking #" + bookingId));
    }

}
