package com.hotel.modules.booking.service;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.auth.repository.UserRepository;
import com.hotel.modules.booking.dto.BookingDTO;
import com.hotel.modules.booking.dto.BookingRequest;
import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.entity.BookingStatus;
import com.hotel.modules.booking.entity.CancelActor;
import com.hotel.modules.booking.repository.BookingRepository;
import com.hotel.modules.booking_services.dto.BookingServiceResponse;
import com.hotel.modules.holiday.entity.HolidayPeriod;
import com.hotel.modules.holiday.service.IHolidayService;
import com.hotel.modules.membership.service.IMembershipService;
import com.hotel.modules.rooms.entity.Room;
import com.hotel.modules.rooms.entity.enums.RoomStatus;
import com.hotel.modules.rooms.repository.RoomRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final IMembershipService membershipService;
    private final IHolidayService holidayService;

    public BookingService(BookingRepository bookingRepository,
                          RoomRepository roomRepository,
                          UserRepository userRepository,
                          @Lazy IMembershipService membershipService,
                          IHolidayService holidayService) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.membershipService = membershipService;
        this.holidayService = holidayService;
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getMyBookings(Long userId, LocalDate checkIn, LocalDate checkOut) {
        return bookingRepository.findMyBookings(userId, checkIn, checkOut)
                .stream().map(this::toDTO).toList();
    }

    // CHECK IN
    @Transactional
    public BookingDTO checkIn(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking không ở trạng thái check-in được");
        }
        if (LocalDateTime.now().isBefore(booking.getCheckInDate().atStartOfDay())) {
            throw new RuntimeException("Chưa đến thời gian check-in");
        }
        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setActualCheckIn(LocalDateTime.now());
        Room room = booking.getRoom();
        room.setStatus(RoomStatus.OCCUPIED);
        bookingRepository.save(booking);
        roomRepository.save(room);
        return toDTO(booking);
    }

    @Transactional(readOnly = true)
    public List<Long> getCheckedInRoomIds() {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_IN)
                .map(b -> b.getRoom().getRoomId()).toList();
    }

    // CHECK OUT
    @Transactional
    public BookingDTO checkOut(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));
        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new RuntimeException("Booking không ở trạng thái check-out được");
        }
        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking.setActualCheckout(LocalDateTime.now());
        Room room = booking.getRoom();
        room.setStatus(RoomStatus.AVAILABLE);
        bookingRepository.save(booking);
        roomRepository.save(room);
        return toDTO(booking);
    }

    @Transactional(readOnly = true)
    public List<Long> getCheckedOutRoomIds() {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_OUT)
                .map(b -> b.getRoom().getRoomId()).toList();
    }

    @Transactional(readOnly = true)
    public List<Long> getOccupiedRoomIds(LocalDate checkIn, LocalDate checkOut) {
        return bookingRepository.findOccupiedRoomIds(checkIn, checkOut);
    }

    // Tạo Booking với tính toán giảm giá đầy đủ
    @Transactional
    public BookingDTO createBooking(BookingRequest request, Long userId) {

        // 1. Validate dates
        if (request.getCheckOut().isBefore(request.getCheckIn())) {
            throw new RuntimeException("Ngày checkout phải sau ngày checkin");
        }

        // 2. Kiểm tra phòng AVAILABLE
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));
        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new RuntimeException("Phòng không khả dụng");
        }

        // 3. Kiểm tra trùng lịch
        List<Long> occupiedRoomIds = getOccupiedRoomIds(request.getCheckIn(), request.getCheckOut());
        if (occupiedRoomIds.contains(request.getRoomId())) {
            throw new RuntimeException("Phòng đã được đặt trong khoảng thời gian này");
        }

        // 4. Lấy user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 5. Tính số đêm
        short totalNights = (short) Math.max(1,
                ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut()));

        // 6. Kiểm tra sức chứa
        int maxGuests = room.getRoomType().getMaxGuests() != null
                ? room.getRoomType().getMaxGuests() : 2;
        int totalGuests = request.getNumAdults() + request.getNumChildren();
        if (totalGuests > maxGuests) {
            throw new RuntimeException("Tổng số khách (" + totalGuests
                    + ") vượt quá sức chứa phòng (" + maxGuests + ")");
        }

        // 7. Tính giá phòng cơ bản
        BigDecimal basePrice = room.getRoomType().getPricePerNight();

        // 8. Kiểm tra kỳ lễ
        Optional<HolidayPeriod> holidayOpt = holidayService.findHolidayForDate(request.getCheckIn());
        BigDecimal holidayMultiplier = holidayOpt
                .map(HolidayPeriod::getPriceMultiplier)
                .orElse(BigDecimal.ONE);

        // Giá sau điều chỉnh lễ
        BigDecimal adjustedRoomPrice = basePrice.multiply(holidayMultiplier)
                .setScale(2, RoundingMode.HALF_UP);

        // 9. Tính giảm giá thành viên
        boolean isFirstBooking = false;
        BigDecimal membershipDiscountPct;

        BigDecimal firstPct = membershipService.getFirstBookingDiscountPct(userId);
        if (firstPct.compareTo(BigDecimal.ZERO) > 0) {
            membershipDiscountPct = firstPct;
            isFirstBooking = true;
        } else {
            membershipDiscountPct = membershipService.getCurrentTierDiscountPct(userId);
        }

        // 10. Tính giảm giá nhóm (≥ 4 khách)
        BigDecimal groupDiscountPct = BigDecimal.ZERO;
        if (totalGuests >= 4) {
            groupDiscountPct = holidayService.getGroupDiscountPct(totalGuests);
        }

        // 11. Tính tiền
        BigDecimal roomTotal = adjustedRoomPrice.multiply(BigDecimal.valueOf(totalNights));

        BigDecimal membershipDiscountAmt = roomTotal
                .multiply(membershipDiscountPct)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal groupDiscountAmt = roomTotal
                .multiply(groupDiscountPct)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal totalDiscount = membershipDiscountAmt.add(groupDiscountAmt);
        // Đảm bảo không giảm quá giá trị đơn hàng
        if (totalDiscount.compareTo(roomTotal) > 0) {
            totalDiscount = roomTotal;
        }

        // 12. Tạo booking — lưu trước để lấy bookingId
        Booking booking = new Booking();
        booking.setBookingCode(UUID.randomUUID().toString().replace("-", "").substring(0, 20));
        booking.setUser(user);
        booking.setRoom(room);
        booking.setCheckInDate(request.getCheckIn());
        booking.setCheckOutDate(request.getCheckOut());
        booking.setNumAdults(request.getNumAdults());
        booking.setNumChildren(request.getNumChildren());
        booking.setSpecialRequest(request.getSpecialRequest());
        booking.setRoomPriceSnapshot(adjustedRoomPrice);  // snapshot giá đã tính lễ
        booking.setTotalNights(totalNights);
        booking.setStatus(BookingStatus.PENDING);
        booking.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        // Discount fields
        booking.setMembershipDiscountPct(membershipDiscountPct);
        booking.setMembershipDiscountAmt(membershipDiscountAmt);
        booking.setIsFirstBookingDiscount(isFirstBooking);
        booking.setHolidayMultiplier(holidayMultiplier);
        booking.setHolidayPeriod(holidayOpt.orElse(null));
        booking.setGroupDiscountPct(groupDiscountPct);
        booking.setGroupDiscountAmt(groupDiscountAmt);
        booking.setGuestCount(totalGuests);
        booking.setDiscountAmount(totalDiscount);

        Booking saved = bookingRepository.saveAndFlush(booking);
        saved.setBookingCode(generateBookingCode(request.getCheckIn(), saved.getBookingId()));
        bookingRepository.save(saved);

        return toDTO(saved);
    }

    // Cancel booking
    @Transactional
    public BookingDTO cancelBooking(Long bookingId, Long userId, CancelActor Actor) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));

        switch (Actor) {
            case USER -> {
                if (!booking.getUser().getUserId().equals(userId)) {
                    throw new RuntimeException("Bạn không có quyền hủy booking này");
                }
                if (booking.getStatus() != BookingStatus.PENDING
                        && booking.getStatus() != BookingStatus.CONFIRMED) {
                    throw new RuntimeException("Booking không thể hủy ở trạng thái hiện tại");
                }
                if (booking.getStatus() == BookingStatus.CONFIRMED) {
                    LocalDateTime checkInDeadline = booking.getCheckInDate().atTime(14, 0);
                    LocalDateTime refundDeadline = checkInDeadline.minusHours(24);
                    if (LocalDateTime.now().isBefore(refundDeadline)) {
                        booking.setStatus(BookingStatus.REFUNDED);
                    } else {
                        booking.setStatus(BookingStatus.CANCELLED);
                    }
                } else {
                    booking.setStatus(BookingStatus.CANCELLED);
                }
            }
            case ADMIN -> {
                if (booking.getStatus() == BookingStatus.CHECKED_OUT) {
                    throw new RuntimeException("Không thể hủy booking đã check-out");
                }
                booking.setStatus(BookingStatus.CANCELLED);
            }
            case SYSTEM -> {
                if (booking.getStatus() != BookingStatus.PENDING) {
                    throw new RuntimeException("System chỉ hủy được booking PENDING");
                }
                booking.setStatus(BookingStatus.CANCELLED);
            }
            default -> throw new RuntimeException("cancelledBy không hợp lệ");
        }

        Room room = booking.getRoom();
        if (room.getStatus() == RoomStatus.OCCUPIED) {
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
        return toDTO(booking);
    }

    public Booking findById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking #" + bookingId));
    }

    public Booking findByBookingCode(String bookingCode) {
        return bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy booking với mã: " + bookingCode));
    }

    @Transactional(readOnly = true)
    public List<String> getBookedDatesByRoomId(Long roomId) {
        List<Booking> activeBookings = bookingRepository.findActiveBookingsByRoomId(roomId);
        return activeBookings.stream()
                .flatMap(b -> b.getCheckInDate()
                        .datesUntil(b.getCheckOutDate())
                        .map(LocalDate::toString))
                .distinct().toList();
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private String generateBookingCode(LocalDate checkIn, Long bookingId) {
        String datePart = checkIn.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return String.format("HB%s-%04d", datePart, bookingId);
    }

    private BookingDTO toDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();

        dto.setBookingId(booking.getBookingId());
        dto.setBookingCode(booking.getBookingCode());
        dto.setNumAdults(booking.getNumAdults());
        dto.setNumChildren(booking.getNumChildren());
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
            if (booking.getRoom().getHotel() != null) {
                dto.setHotelName(booking.getRoom().getHotel().getHotelName());
                dto.setHotelAddress(booking.getRoom().getHotel().getAddress());
            }
        }

        // Tiền phòng (đã nhân holiday multiplier qua snapshot)
        BigDecimal roomTotal = BigDecimal.ZERO;
        if (booking.getRoomPriceSnapshot() != null && booking.getTotalNights() != null) {
            roomTotal = booking.getRoomPriceSnapshot()
                    .multiply(BigDecimal.valueOf(booking.getTotalNights()));
        }
        dto.setTotalAmount(roomTotal);

        // Dịch vụ
        BigDecimal serviceTotal = BigDecimal.ZERO;
        if (booking.getBookingServices() != null && !booking.getBookingServices().isEmpty()) {
            List<BookingServiceResponse> serviceResponses = booking.getBookingServices().stream()
                    .map(bs -> {
                        BookingServiceResponse res = new BookingServiceResponse();
                        res.setServiceId(bs.getId().getServiceId());
                        if (bs.getExtraService() != null) {
                            res.setServiceName(bs.getExtraService().getServiceName());
                        }
                        res.setQuantity(bs.getQuantity());
                        res.setUnitPriceSnap(bs.getUnitPriceSnap());
                        BigDecimal subtotal = bs.getSubtotal() != null ? bs.getSubtotal()
                                : (bs.getUnitPriceSnap() != null
                                    ? bs.getUnitPriceSnap().multiply(BigDecimal.valueOf(bs.getQuantity()))
                                    : BigDecimal.ZERO);
                        res.setSubtotal(subtotal);
                        return res;
                    }).toList();
            dto.setBookingServices(serviceResponses);
            serviceTotal = serviceResponses.stream()
                    .map(BookingServiceResponse::getSubtotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        dto.setServiceTotal(serviceTotal);
        BigDecimal grandTotal = roomTotal.add(serviceTotal);
        dto.setGrandTotal(grandTotal);

        // Discount breakdown
        BigDecimal discountAmt = booking.getDiscountAmount() != null
                ? booking.getDiscountAmount() : BigDecimal.ZERO;
        dto.setDiscountAmount(discountAmt);
        dto.setFinalAmount(grandTotal.subtract(discountAmt));

        dto.setMembershipDiscountPct(booking.getMembershipDiscountPct());
        dto.setMembershipDiscountAmt(booking.getMembershipDiscountAmt());
        dto.setIsFirstBookingDiscount(booking.getIsFirstBookingDiscount());
        dto.setHolidayMultiplier(booking.getHolidayMultiplier());
        dto.setGroupDiscountPct(booking.getGroupDiscountPct());
        dto.setGroupDiscountAmt(booking.getGroupDiscountAmt());
        dto.setGuestCount(booking.getGuestCount());

        if (booking.getHolidayPeriod() != null) {
            dto.setHolidayPeriodName(booking.getHolidayPeriod().getNameVi());
        }

        // Tên hạng thành viên (lấy từ membership hiện tại của user)
        if (booking.getUser() != null) {
            try {
                var cm = membershipService.getOrCreateMembership(booking.getUser().getUserId());
                dto.setMembershipTierName(cm.getTier().getDisplayNameVi());
            } catch (Exception ignored) {
                // không block toDTO nếu membership chưa tồn tại
            }
        }

        return dto;
    }
}
