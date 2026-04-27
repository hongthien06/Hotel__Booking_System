package com.hotel.modules.room.controller;

import com.hotel.modules.room.dto.request.RoomRequest;
import com.hotel.modules.room.dto.response.RoomResponse;
import com.hotel.modules.room.entity.enums.RoomStatus;
import com.hotel.modules.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<RoomResponse>> getAllRoomsByStatus(@PathVariable RoomStatus status) {
        return ResponseEntity.ok(roomService.getByStatus(status));
    }

    @GetMapping("/type/{typeName}")
    public ResponseEntity<List<RoomResponse>> getRoomsByTypeName(@PathVariable String typeName) {
        return ResponseEntity.ok(roomService.getByTypeName(typeName));
    }

    @GetMapping("/province/{province}")
    public ResponseEntity<List<RoomResponse>> getRoomsByProvince(@PathVariable String province) {
        return ResponseEntity.ok(roomService.getByProvince(province));
    }

    @GetMapping("/search")
    public ResponseEntity<List<RoomResponse>> getRoomsByPriceRange(
            @RequestParam(defaultValue = "0") BigDecimal min,
            @RequestParam(defaultValue = "999999999") BigDecimal max) {
        return ResponseEntity.ok(roomService.getByPriceRange(min, max));
    }

    // Available room
    @GetMapping("/available")
    public ResponseEntity<List<RoomResponse>> getAvailableRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String typeName,
            @RequestParam(required = false) String bedType) {
        return ResponseEntity.ok(roomService.getAvailableRooms(
                checkIn, checkOut, province, minPrice, maxPrice, typeName, bedType
        ));
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@RequestBody RoomRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long id, @RequestBody RoomRequest req) {
        return ResponseEntity.ok(roomService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RoomResponse> updateRoomStatus(@PathVariable Long id, @RequestBody RoomStatus status) {
        return ResponseEntity.ok(roomService.updateStatus(id, status));
    }

}