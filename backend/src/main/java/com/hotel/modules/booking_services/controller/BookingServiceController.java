package com.hotel.modules.booking_services.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hotel.modules.booking_services.dto.BookingServiceRequest;
import com.hotel.modules.booking_services.dto.BookingServiceResponse;
import com.hotel.modules.booking_services.service.BookingServiceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/bookings/{bookingId}/services")
@RequiredArgsConstructor
public class BookingServiceController {

    private final BookingServiceService bookingServiceService;

    @GetMapping
    public ResponseEntity<List<BookingServiceResponse>> getServices(@PathVariable Long bookingId) {
        return ResponseEntity.ok(bookingServiceService.getServicesByBooking(bookingId));
    }

    @PostMapping
    public ResponseEntity<BookingServiceResponse> addService(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingServiceRequest request) {
        return ResponseEntity.ok(bookingServiceService.addServiceToBooking(bookingId, request));
    }

    @PutMapping("/{serviceId}")
    public ResponseEntity<BookingServiceResponse> updateQuantity(
            @PathVariable Long bookingId,
            @PathVariable Integer serviceId,
            @RequestParam Short quantity) {
        return ResponseEntity.ok(bookingServiceService.updateServiceQuantity(bookingId, serviceId, quantity));
    }

    @DeleteMapping("/{serviceId}")
    public ResponseEntity<Void> removeService(
            @PathVariable Long bookingId,
            @PathVariable Integer serviceId) {
        bookingServiceService.removeServiceFromBooking(bookingId, serviceId);
        return ResponseEntity.noContent().build();
    }
}
