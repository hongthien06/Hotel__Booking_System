package com.hotel.modules.booking.service;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.auth.repository.UserRepository;
import com.hotel.modules.booking.dto.BookingDTO;
import com.hotel.modules.booking.dto.BookingRequest;
import com.hotel.modules.booking.dto.BookingRoomDTO;
import com.hotel.modules.booking.entity.Booking;
import com.hotel.modules.booking.entity.BookingRoom;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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
        List<Booking> bookings = bookingRepository.findMyBookings(userId, checkIn, checkOut);
        return bookings.stream()
                .map(booking -> {
                    BookingDTO dto = toDTO(booking);
                    findGroupedStatusForLegacyCancelledBooking(booking, bookings)
                            .ifPresent(dto::setStatus);
                    return dto;
                }).toList();
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
        List<Room> rooms = getRoomsForBooking(booking);
        rooms.forEach(room -> room.setStatus(RoomStatus.OCCUPIED));
        bookingRepository.save(booking);
        roomRepository.saveAll(rooms);
        return toDTO(booking);
    }

    @Transactional(readOnly = true)
    public List<Long> getCheckedInRoomIds() {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_IN)
                .flatMap(b -> getRoomsForBooking(b).stream())
                .map(Room::getRoomId)
                .distinct().toList();
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
        List<Room> rooms = getRoomsForBooking(booking);
        rooms.forEach(room -> room.setStatus(RoomStatus.AVAILABLE));
        bookingRepository.save(booking);
        roomRepository.saveAll(rooms);
        return toDTO(booking);
    }

    @Transactional(readOnly = true)
    public List<Long> getCheckedOutRoomIds() {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CHECKED_OUT)
                .flatMap(b -> getRoomsForBooking(b).stream())
                .map(Room::getRoomId)
                .distinct().toList();
    }

    @Transactional(readOnly = true)
    public List<Long> getOccupiedRoomIds(LocalDate checkIn, LocalDate checkOut) {
        return bookingRepository.findActiveBookingsInRange(checkIn, checkOut).stream()
                .flatMap(b -> getRoomsForBooking(b).stream())
                .map(Room::getRoomId)
                .distinct()
                .toList();
    }

    // Tạo Booking với tính toán giảm giá đầy đủ
    @Transactional
    public BookingDTO createBooking(BookingRequest request, Long userId) {

        // 1. Validate dates
        if (request.getCheckOut().isBefore(request.getCheckIn())) {
            throw new RuntimeException("Ngày checkout phải sau ngày checkin");
        }

        // 2. Gom danh sách phòng trong cùng một đơn
        List<Long> roomIds = normalizeRoomIds(request);
        if (roomIds.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ít nhất một phòng");
        }
        List<Room> rooms = roomIds.stream()
                .map(roomId -> roomRepository.findById(roomId)
                        .orElseThrow(() -> new RuntimeException("Phòng không tồn tại: " + roomId)))
                .toList();

        // 3. Kiểm tra phòng AVAILABLE và trùng lịch
        List<Long> occupiedRoomIds = getOccupiedRoomIds(request.getCheckIn(), request.getCheckOut());
        for (Room room : rooms) {
            if (room.getStatus() != RoomStatus.AVAILABLE) {
                throw new RuntimeException("Phòng " + room.getRoomNumber() + " không khả dụng");
            }
            if (occupiedRoomIds.contains(room.getRoomId())) {
                throw new RuntimeException("Phòng " + room.getRoomNumber()
                        + " đã được đặt trong khoảng thời gian này");
            }
        }

        // 4. Lấy user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // 5. Tính số đêm
        short totalNights = (short) Math.max(1,
                ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut()));

        // 6. Kiểm tra sức chứa theo tổng số phòng trong đơn (Miễn phí tối đa 1 trẻ em đi kèm mỗi phòng)
        int maxGuests = rooms.stream()
                .mapToInt(room -> room.getRoomType().getMaxGuests() != null
                        ? room.getRoomType().getMaxGuests() : 2)
                .sum();
        int totalGuests = request.getNumAdults() + request.getNumChildren();
        int numRooms = rooms.size();
        int effectiveGuests = request.getNumAdults() + Math.max(0, request.getNumChildren() - numRooms);
        if (effectiveGuests > maxGuests) {
            throw new RuntimeException("Số khách quy đổi (" + effectiveGuests
                    + ") vượt quá tổng sức chứa của các phòng đã chọn (" + maxGuests
                    + "). Lưu ý: Mỗi phòng chỉ được đi kèm tối đa 1 trẻ em miễn phí.");
        }

        // 7. Kiểm tra kỳ lễ
        Optional<HolidayPeriod> holidayOpt = holidayService.findHolidayForDate(request.getCheckIn());
        BigDecimal holidayMultiplier = holidayOpt
                .map(HolidayPeriod::getPriceMultiplier)
                .orElse(BigDecimal.ONE);

        List<BigDecimal> adjustedRoomPrices = rooms.stream()
                .map(room -> room.getRoomType().getPricePerNight()
                        .multiply(holidayMultiplier)
                        .setScale(2, RoundingMode.HALF_UP))
                .toList();
        BigDecimal adjustedNightlyTotal = adjustedRoomPrices.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 8. Tính giảm giá thành viên
        boolean isFirstBooking = false;
        BigDecimal membershipDiscountPct;

        BigDecimal firstPct = membershipService.getFirstBookingDiscountPct(userId);
        if (firstPct.compareTo(BigDecimal.ZERO) > 0) {
            membershipDiscountPct = firstPct;
            isFirstBooking = true;
        } else {
            membershipDiscountPct = membershipService.getCurrentTierDiscountPct(userId);
        }

        // 9. Tính giảm giá nhóm (≥ 4 khách) theo tổng khách của đơn
        BigDecimal groupDiscountPct = BigDecimal.ZERO;
        if (totalGuests >= 4) {
            groupDiscountPct = holidayService.getGroupDiscountPct(totalGuests);
        }

        // 10. Tính tiền trên toàn bộ phòng trong đơn
        BigDecimal roomTotal = adjustedNightlyTotal.multiply(BigDecimal.valueOf(totalNights));

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

        // 11. Tạo booking — lưu trước để lấy bookingId
        Booking booking = new Booking();
        booking.setBookingCode(UUID.randomUUID().toString().replace("-", "").substring(0, 20));
        booking.setUser(user);
        booking.setRoom(rooms.get(0));
        booking.setCheckInDate(request.getCheckIn());
        booking.setCheckOutDate(request.getCheckOut());
        booking.setNumAdults(request.getNumAdults());
        booking.setNumChildren(request.getNumChildren());
        booking.setSpecialRequest(request.getSpecialRequest());
        booking.setRoomPriceSnapshot(adjustedNightlyTotal);  // tổng snapshot/đêm của cả đơn
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

        for (int i = 0; i < rooms.size(); i++) {
            BookingRoom bookingRoom = new BookingRoom();
            bookingRoom.setBooking(booking);
            bookingRoom.setRoom(rooms.get(i));
            bookingRoom.setRoomPriceSnapshot(adjustedRoomPrices.get(i));
            bookingRoom.setSortOrder(i);
            booking.getBookingRooms().add(bookingRoom);
        }

        Booking saved = bookingRepository.saveAndFlush(booking);
        saved.setBookingCode(generateBookingCode(request.getCheckIn(), saved.getBookingId()));
        bookingRepository.save(saved);

        return toDTO(saved);
    }

    @Transactional
    public BookingDTO mergePendingBookings(List<Long> bookingIds, Long userId) {
        if (bookingIds == null || bookingIds.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ít nhất một booking để thanh toán");
        }

        List<Long> distinctIds = bookingIds.stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .toList();
        if (distinctIds.isEmpty()) {
            throw new RuntimeException("Danh sách booking không hợp lệ");
        }

        List<Booking> bookings = bookingRepository.findAllById(distinctIds).stream()
                .sorted(Comparator.comparing(Booking::getBookingId))
                .toList();
        if (bookings.size() != distinctIds.size()) {
            throw new RuntimeException("Một số booking không tồn tại");
        }

        Booking primary = bookings.get(0);
        for (Booking booking : bookings) {
            if (booking.getUser() == null || !booking.getUser().getUserId().equals(userId)) {
                throw new RuntimeException("Bạn không có quyền thanh toán một trong các booking đã chọn");
            }
            if (booking.getStatus() != BookingStatus.PENDING) {
                throw new RuntimeException("Chỉ có thể gom các booking đang chờ thanh toán");
            }
            if (!booking.getCheckInDate().equals(primary.getCheckInDate())
                    || !booking.getCheckOutDate().equals(primary.getCheckOutDate())) {
                throw new RuntimeException("Chỉ có thể gom các phòng có cùng ngày nhận và trả phòng");
            }
        }

        Map<Long, RoomSnapshot> snapshots = new LinkedHashMap<>();
        for (Booking booking : bookings) {
            for (RoomSnapshot snapshot : getRoomSnapshots(booking)) {
                snapshots.putIfAbsent(snapshot.room().getRoomId(), snapshot);
            }
        }
        if (snapshots.isEmpty()) {
            throw new RuntimeException("Không tìm thấy phòng để gom booking");
        }

        int adults = bookings.stream().mapToInt(b -> b.getNumAdults() != null ? b.getNumAdults() : 0).sum();
        int children = bookings.stream().mapToInt(b -> b.getNumChildren() != null ? b.getNumChildren() : 0).sum();
        if (adults > Byte.MAX_VALUE || children > Byte.MAX_VALUE) {
            throw new RuntimeException("Số lượng khách vượt quá giới hạn cho một đơn");
        }
        int totalGuests = adults + children;
        int numRooms = snapshots.size();
        int effectiveGuests = adults + Math.max(0, children - numRooms);
        int maxGuests = snapshots.values().stream()
                .map(RoomSnapshot::room)
                .mapToInt(room -> room.getRoomType().getMaxGuests() != null
                        ? room.getRoomType().getMaxGuests() : 2)
                .sum();
        if (effectiveGuests > maxGuests) {
            throw new RuntimeException("Số khách quy đổi (" + effectiveGuests
                    + ") vượt quá tổng sức chứa của các phòng đã chọn (" + maxGuests
                    + "). Lưu ý: Mỗi phòng chỉ được đi kèm tối đa 1 trẻ em miễn phí.");
        }

        BigDecimal nightlyTotal = snapshots.values().stream()
                .map(RoomSnapshot::priceSnapshot)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal roomTotal = nightlyTotal.multiply(BigDecimal.valueOf(primary.getTotalNights()));

        BigDecimal membershipDiscountPct = primary.getMembershipDiscountPct() != null
                ? primary.getMembershipDiscountPct() : BigDecimal.ZERO;
        BigDecimal membershipDiscountAmt = roomTotal.multiply(membershipDiscountPct)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal groupDiscountPct = totalGuests >= 4
                ? holidayService.getGroupDiscountPct(totalGuests)
                : BigDecimal.ZERO;
        BigDecimal groupDiscountAmt = roomTotal.multiply(groupDiscountPct)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal totalDiscount = membershipDiscountAmt.add(groupDiscountAmt);
        if (totalDiscount.compareTo(roomTotal) > 0) {
            totalDiscount = roomTotal;
        }

        primary.setRoom(snapshots.values().iterator().next().room());
        primary.setRoomPriceSnapshot(nightlyTotal);
        primary.setNumAdults((byte) adults);
        primary.setNumChildren((byte) children);
        primary.setGuestCount(totalGuests);
        primary.setMembershipDiscountAmt(membershipDiscountAmt);
        primary.setGroupDiscountPct(groupDiscountPct);
        primary.setGroupDiscountAmt(groupDiscountAmt);
        primary.setDiscountAmount(totalDiscount);
        primary.setUpdatedAt(LocalDateTime.now());

        Set<Long> primaryRoomIds = primary.getBookingRooms() != null
                ? primary.getBookingRooms().stream()
                        .map(br -> br.getRoom().getRoomId())
                        .collect(java.util.stream.Collectors.toSet())
                : new LinkedHashSet<>();

        if (primary.getBookingRooms() == null || primary.getBookingRooms().isEmpty()) {
            BookingRoom bookingRoom = new BookingRoom();
            bookingRoom.setBooking(primary);
            bookingRoom.setRoom(primary.getRoom());
            bookingRoom.setRoomPriceSnapshot(primary.getRoomPriceSnapshot());
            bookingRoom.setSortOrder(0);
            primary.getBookingRooms().add(bookingRoom);
            primaryRoomIds.add(primary.getRoom().getRoomId());
        }

        int sortOrder = primary.getBookingRooms().size();
        for (RoomSnapshot snapshot : snapshots.values()) {
            if (primaryRoomIds.contains(snapshot.room().getRoomId())) {
                continue;
            }
            BookingRoom bookingRoom = new BookingRoom();
            bookingRoom.setBooking(primary);
            bookingRoom.setRoom(snapshot.room());
            bookingRoom.setRoomPriceSnapshot(snapshot.priceSnapshot());
            bookingRoom.setSortOrder(sortOrder++);
            primary.getBookingRooms().add(bookingRoom);
        }

        for (Booking booking : bookings) {
            if (!booking.getBookingId().equals(primary.getBookingId())) {
                booking.setMergedIntoBooking(primary);
                booking.setUpdatedAt(LocalDateTime.now());
            }
        }

        bookingRepository.saveAll(bookings);
        return toDTO(primary);
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

        List<Room> rooms = getRoomsForBooking(booking);
        rooms.stream()
                .filter(room -> room.getStatus() == RoomStatus.OCCUPIED)
                .forEach(room -> room.setStatus(RoomStatus.AVAILABLE));
        roomRepository.saveAll(rooms);
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

    public BigDecimal calculateRoomTotal(Booking booking) {
        return getBookingRoomDTOs(booking).stream()
                .map(BookingRoomDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<Long> normalizeRoomIds(BookingRequest request) {
        Set<Long> ids = new LinkedHashSet<>();
        if (request.getRoomIds() != null) {
            request.getRoomIds().stream()
                    .filter(id -> id != null && id > 0)
                    .forEach(ids::add);
        }
        if (ids.isEmpty() && request.getRoomId() != null) {
            ids.add(request.getRoomId());
        }
        return new ArrayList<>(ids);
    }

    private List<Room> getRoomsForBooking(Booking booking) {
        if (booking.getBookingRooms() != null && !booking.getBookingRooms().isEmpty()) {
            return booking.getBookingRooms().stream()
                    .map(BookingRoom::getRoom)
                    .filter(room -> room != null)
                    .distinct()
                    .toList();
        }
        return booking.getRoom() != null ? List.of(booking.getRoom()) : List.of();
    }

    private List<RoomSnapshot> getRoomSnapshots(Booking booking) {
        if (booking.getBookingRooms() != null && !booking.getBookingRooms().isEmpty()) {
            return booking.getBookingRooms().stream()
                    .map(br -> new RoomSnapshot(br.getRoom(), br.getRoomPriceSnapshot()))
                    .toList();
        }
        if (booking.getRoom() == null) {
            return List.of();
        }
        return List.of(new RoomSnapshot(booking.getRoom(), booking.getRoomPriceSnapshot()));
    }

    private Optional<BookingStatus> findGroupedStatusForLegacyCancelledBooking(Booking booking, List<Booking> allBookings) {
        if (booking.getStatus() != BookingStatus.CANCELLED || booking.getRoom() == null) {
            return Optional.empty();
        }
        Long roomId = booking.getRoom().getRoomId();
        return allBookings.stream()
                .filter(other -> !other.getBookingId().equals(booking.getBookingId()))
                .filter(other -> other.getStatus() != BookingStatus.CANCELLED
                        && other.getStatus() != BookingStatus.REFUNDED)
                .filter(other -> other.getCheckInDate().equals(booking.getCheckInDate())
                        && other.getCheckOutDate().equals(booking.getCheckOutDate()))
                .filter(other -> getRoomsForBooking(other).size() > 1)
                .filter(other -> getRoomsForBooking(other).stream()
                        .anyMatch(room -> room.getRoomId().equals(roomId)))
                .map(Booking::getStatus)
                .findFirst();
    }

    private List<BookingRoomDTO> getBookingRoomDTOs(Booking booking) {
        if (booking.getBookingRooms() != null && !booking.getBookingRooms().isEmpty()) {
            return booking.getBookingRooms().stream()
                    .map(br -> toBookingRoomDTO(br.getRoom(), booking, br.getRoomPriceSnapshot()))
                    .toList();
        }
        if (booking.getRoom() == null) {
            return List.of();
        }
        return List.of(toBookingRoomDTO(booking.getRoom(), booking, booking.getRoomPriceSnapshot()));
    }

    private BookingRoomDTO toBookingRoomDTO(Room room, Booking booking, BigDecimal priceSnapshot) {
        BookingRoomDTO dto = new BookingRoomDTO();
        dto.setRoomId(room.getRoomId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomPriceSnapshot(priceSnapshot != null ? priceSnapshot : BigDecimal.ZERO);
        dto.setTotalNights(booking.getTotalNights());
        dto.setSubtotal(dto.getRoomPriceSnapshot()
                .multiply(BigDecimal.valueOf(booking.getTotalNights() != null ? booking.getTotalNights() : 0)));
        if (room.getRoomType() != null) {
            dto.setRoomTypeName(room.getRoomType().getTypeName());
        }
        if (room.getHotel() != null) {
            dto.setHotelName(room.getHotel().getHotelName());
            dto.setHotelAddress(room.getHotel().getAddress());
        }
        return dto;
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
        dto.setStatus(booking.getMergedIntoBooking() != null
                ? booking.getMergedIntoBooking().getStatus()
                : booking.getStatus());
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

        List<BookingRoomDTO> bookingRooms = getBookingRoomDTOs(booking);
        dto.setRooms(bookingRooms);

        // Tiền phòng (đã nhân holiday multiplier qua snapshot)
        BigDecimal roomTotal = bookingRooms.stream()
                .map(BookingRoomDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
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

    private record RoomSnapshot(Room room, BigDecimal priceSnapshot) {}
}
