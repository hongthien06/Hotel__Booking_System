package com.hotel.modules.booking.controller;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.booking.dto.BookingRequest;
import com.hotel.modules.booking.dto.MergeBookingsRequest;
import com.hotel.modules.booking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static com.hotel.modules.booking.entity.CancelActor.ADMIN;
import static com.hotel.modules.booking.entity.CancelActor.USER;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Admin lấy tất cả booking
    @GetMapping
    public ResponseEntity<?> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // User lấy booking của mình, có thể lọc theo ngày
    @GetMapping("/my-bookings")
    public ResponseEntity<?> getMyBookings(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) LocalDate checkIn,
            @RequestParam(required = false) LocalDate checkOut) {
        return ResponseEntity.ok(bookingService.getMyBookings(user.getUserId(), checkIn, checkOut));
    }

    // Admin lấy booking theo id
    @PutMapping("/{id}/check-in")
    public ResponseEntity<?> checkIn(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkIn(id));
    }

    // Admin check-out
    @PutMapping("/{id}/check-out")
    public ResponseEntity<?> checkOut(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkOut(id));
    }

    // Lấy danh sách roomId đã check-in
    @GetMapping("/checked-in-rooms")
    public List<Long> getCheckedInRoomIds() {
        return bookingService.getCheckedInRoomIds();
    }

    // Lấy danh sách roomId đã check-out để tránh xung đột khi check-in mới
    @GetMapping("/checked-out-rooms")
    public List<Long> getCheckedOutRoomIds() {
        return bookingService.getCheckedOutRoomIds();
    }

    @GetMapping("/occupied-rooms")
    public ResponseEntity<?> getOccupiedRooms(
            @RequestParam LocalDate checkIn,
            @RequestParam LocalDate checkOut) {
        return ResponseEntity.ok(bookingService.getOccupiedRoomIds(checkIn, checkOut));
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((User) userDetails).getUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request, userId));
    }

    @PostMapping("/merge-pending")
    public ResponseEntity<?> mergePendingBookings(
            @RequestBody MergeBookingsRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((User) userDetails).getUserId();
        return ResponseEntity.ok(bookingService.mergePendingBookings(request.getBookingIds(), userId));
    }

    // User hủy
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((User) userDetails).getUserId();
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId, USER));
    }

    // Admin hủy
    @PutMapping("/{id}/cancel/admin")
    public ResponseEntity<?> cancelBookingByAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, null, ADMIN));
    }

    @GetMapping("/room/{roomId}/booked-dates")
    public ResponseEntity<?> getBookedDates(@PathVariable Long roomId) {
        return ResponseEntity.ok(bookingService.getBookedDatesByRoomId(roomId));
    }

    @GetMapping("/room/{roomId}/conflict")
    public ResponseEntity<?> checkRoomConflict(@PathVariable Long roomId,
                                               @RequestParam LocalDate checkIn,
                                               @RequestParam LocalDate checkOut) {
        boolean conflict = bookingService.isRoomConflicting(roomId, checkIn, checkOut);
        return ResponseEntity.ok(Map.of("conflict", conflict));
    }

}
