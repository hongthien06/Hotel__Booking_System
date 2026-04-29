package com.hotel.modules.booking.controller;

import com.hotel.modules.auth.entity.User;
import com.hotel.modules.booking.dto.BookingRequest;
import com.hotel.modules.booking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

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

    @GetMapping
    public ResponseEntity<?> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<?> getMyBookings(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) LocalDate checkIn,
            @RequestParam(required = false) LocalDate checkOut) {
        return ResponseEntity.ok(bookingService.getMyBookings(user.getUserId(), checkIn, checkOut));
    }

    @PutMapping("/{id}/check-in")
    public ResponseEntity<?> checkIn(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkIn(id));
    }

    @PutMapping("/{id}/check-out")
    public ResponseEntity<?> checkOut(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkOut(id));
    }

    // Lấy danh sách roomId đã check-in
    @GetMapping("/checked-in-rooms")
    public List<Long> getCheckedInRoomIds() {
        return bookingService.getCheckedInRoomIds();
    }

    // Lấy danh sách roomId đã check-out
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

    // User hủy
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, user.getUserId(), USER));
    }

    // Admin hủy
    @PutMapping("/{id}/cancel/admin")
    public ResponseEntity<?> cancelBookingByAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, null, ADMIN));
    }

}