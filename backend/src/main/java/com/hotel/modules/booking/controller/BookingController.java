package com.hotel.modules.booking.controller;

import com.hotel.modules.booking.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<?> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
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
}