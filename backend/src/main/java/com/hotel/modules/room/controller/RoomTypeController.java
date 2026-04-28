package com.hotel.modules.room.controller;

import com.hotel.modules.room.dto.request.RoomTypeRequest;
import com.hotel.modules.room.dto.response.RoomTypeResponse;
import com.hotel.modules.room.service.RoomTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/room-types")
@RequiredArgsConstructor
public class RoomTypeController {
    private final RoomTypeService roomTypeService;

    // HTTP Response
    @GetMapping
    public ResponseEntity<List<RoomTypeResponse>> getAll() {
        return ResponseEntity.ok(roomTypeService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomTypeResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomTypeService.getById(id));
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<RoomTypeResponse>> getByHotelId(@PathVariable Integer hotelId) {
        return ResponseEntity.ok(roomTypeService.getByHotelId(hotelId));
    }

    @PostMapping
    public ResponseEntity<RoomTypeResponse> create(@RequestBody RoomTypeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomTypeService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomTypeResponse> update(@PathVariable Integer id, @RequestBody RoomTypeRequest req) {
        return ResponseEntity.ok(roomTypeService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        roomTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
